import { VoteRepo, VoteWithDetails } from "../repositories/vote-repo";
import { MatchRepo } from "../repositories/match-repo";
import { MatchPlayerRepo } from "../repositories/match-player-repo";
import { CompetitionRepo } from "../repositories/competition/competition-repo";
import { DashboardService } from "./dashboard-service";
import { transformDashboardVotesToResponse } from "../utils/dashboard-transforms";
import prisma from "../repositories/prisma-client";
import { DashboardPlayerRepo } from "../repositories/dashboard-player-repo";
import { PrismaTransaction } from "../types";
import { MatchService } from "./match/match-service";
import { transformMatchServiceToPendingVotes } from "../utils/votes-transforms";

export class VoteService {
  // Business logic: Get all votes for a dashboard
  static async getDashboardVotes(userId: string) {
    const dashboardId = await DashboardService.getDashboardIdFromUserId(userId);

    // Get competitions with voting enabled for this dashboard
    const competitions = await CompetitionRepo.findByDashboardId(dashboardId, {
      votingEnabled: true,
    });

    if (competitions.length === 0) {
      return [];
    }

    // Get all matches from these competitions
    const competitionIds = competitions.map((c) => c.id);
    const matches = await MatchRepo.findByCompetitionIds(competitionIds);

    if (matches.length === 0) {
      return [];
    }

    // Get all votes from these matches
    const matchIds = matches.map((m) => m.id);
    const votes = await VoteRepo.findByMatchIds(matchIds);

    return transformDashboardVotesToResponse(votes);
  }

  // Business logic: Submit votes with validation
  static async submitVotes(
    matchId: string,
    voterId: string,
    votes: { playerId: string; points: number }[],
    requestingUserId: string
  ) {
    // Validate match exists and voting is open
    const match = await MatchRepo.findById(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    if (match.voting_status !== "OPEN") {
      throw new Error("Voting is closed for this match");
    }

    console.log(match.voting_ends_at && match.voting_ends_at < new Date());

    // Check if voting has expired
    if (match.voting_ends_at && match.voting_ends_at < new Date()) {
      throw new Error("Voting period has expired");
    }

    // Validate voter is a participant in the match
    const isParticipant = await MatchPlayerRepo.isPlayerInMatch(
      voterId,
      matchId
    );
    if (!isParticipant) {
      throw new Error("Voter must be a participant in the match");
    }

    // Check if user has permission (either the voter themselves or an admin/moderator)
    const canVote = await this.canUserSubmitVotesForPlayer(
      matchId,
      voterId,
      requestingUserId
    );
    if (!canVote) {
      throw new Error("Not authorized to submit votes for this player");
    }

    // Check if player has already voted
    const existingVotes = await VoteRepo.findByVoterAndMatch(voterId, matchId);
    if (existingVotes.length > 0) {
      throw new Error("Player has already voted for this match");
    }

    // Validate vote data
    this.validateVoteData(votes);

    // Create votes in transaction
    return await prisma.$transaction(async (tx) => {
      const voteData = votes.map((vote) => ({
        match_id: matchId,
        voter_id: voterId,
        match_player_id: vote.playerId,
        points: vote.points,
        created_at: new Date(),
      }));

      await VoteRepo.createMany(voteData, tx);

      // Check if all players have voted and close voting if needed
      await this.checkAndCloseVoting(matchId, tx);

      return { success: true, message: "Votes submitted successfully" };
    });
  }

  // Business logic: Get voting status for a match
  static async getVotingStatus(matchId: string, voterId: string) {
    const match = await MatchRepo.findByIdWithDetails(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    // Check if voter is a participant
    const isParticipant = await MatchPlayerRepo.isPlayerInMatch(
      voterId,
      matchId
    );
    if (!isParticipant) {
      throw new Error("Player has not played in this match");
    }

    // Check if player has already voted
    const hasVoted = await this.hasPlayerVoted(voterId, matchId);

    return {
      matchId,
      votingOpen: match.voting_status === "OPEN",
      votingEndsAt: match.voting_ends_at,
      hasVoted,
      players: match.matchPlayers.map((player) => ({
        id: player.id,
        nickname: player.dashboard_player.nickname,
        isHome: player.is_home,
        canVoteFor: player.dashboard_player_id !== voterId,
      })),
    };
  }

  // Business logic: Get pending voters for a match
  static async getPendingVoters(matchId: string): Promise<string[]> {
    // Get all players in the match
    const matchPlayers =
      await MatchPlayerRepo.getMatchPlayersFromMatch(matchId);
    const allPlayerIds = matchPlayers.map((mp) => mp.dashboard_player_id);

    // Get players who have already voted
    const votedPlayerIds = await VoteRepo.getDistinctVotersByMatch(matchId);

    // Return players who haven't voted yet
    return allPlayerIds.filter((id) => !votedPlayerIds.includes(id));
  }

  // Business logic: Check if player has voted
  static async hasPlayerVoted(
    voterId: string,
    matchId: string
  ): Promise<boolean> {
    const count = await VoteRepo.countByVoterAndMatch(voterId, matchId);
    return count > 0;
  }

  // Business logic: Get votes for a specific match
  static async getMatchVotes(
    matchId: string,
    options?: { limit?: number; offset?: number }
  ) {
    const match = await MatchRepo.findByIdWithDetails(matchId);
    if (!match) {
      throw new Error("Match not found");
    }
    const matchVoteResponse = transformMatchServiceToPendingVotes(match);
    return matchVoteResponse;
  }

  // Business logic: Get votes by a specific voter
  static async getVoterVotes(
    voterId: string,
    options?: { limit?: number; offset?: number }
  ) {
    return await VoteRepo.findByVoterId(voterId, options);
  }

  // Business logic: Delete votes for a match (admin only)
  static async deleteMatchVotes(matchId: string, requestingUserId: string) {
    // Check if user is admin/moderator for this match
    const canDelete = await this.canUserModifyMatchVotes(
      matchId,
      requestingUserId
    );
    if (!canDelete) {
      throw new Error("Only administrators can delete match votes");
    }

    return await VoteRepo.deleteByMatch(matchId);
  }

  // Private helper methods for business logic
  private static async canUserSubmitVotesForPlayer(
    matchId: string,
    voterId: string,
    requestingUserId: string
  ): Promise<boolean> {
    // User can submit votes for themselves
    const voterUser = await DashboardPlayerRepo.findById(voterId);
    if (voterUser?.user_id === requestingUserId) {
      return true;
    }

    // Or if they're an admin/moderator for this match
    return await this.canUserModifyMatchVotes(matchId, requestingUserId);
  }

  private static async canUserModifyMatchVotes(
    matchId: string,
    userId: string
  ): Promise<boolean> {
    const match = await MatchRepo.findByIdWithDetails(matchId);
    if (!match) return false;

    // Check if user is dashboard admin
    const isDashboardAdmin = match.competition.dashboard.admin_id === userId;
    if (isDashboardAdmin) return true;

    // Check if user is competition moderator
    const isCompetitionModerator = match.competition.moderators.some(
      (mod) => mod.dashboard_player.user_id === userId
    );

    return isCompetitionModerator;
  }

  private static validateVoteData(
    votes: { playerId: string; points: number }[]
  ): void {
    if (!votes || votes.length !== 3) {
      throw new Error("Exactly 3 votes are required");
    }

    const points = votes.map((v) => v.points).sort((a, b) => b - a);
    if (points[0] !== 3 || points[1] !== 2 || points[2] !== 1) {
      throw new Error("Votes must be 3, 2, and 1 points respectively");
    }

    const playerIds = votes.map((v) => v.playerId);
    const uniquePlayerIds = [...new Set(playerIds)];
    if (uniquePlayerIds.length !== 3) {
      throw new Error("Must vote for 3 different players");
    }
  }

  private static async checkAndCloseVoting(
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    const pendingVoters = await this.getPendingVoters(matchId);

    if (pendingVoters.length === 0) {
      await MatchRepo.updateVotingStatus(matchId, "CLOSED", new Date(), tx);
    }
  }
}
