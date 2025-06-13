import { VoteRepo } from "../repositories/vote-repo";
import { MatchRepo } from "../repositories/match-repo";
import { MatchPlayerRepo } from "../repositories/match-player-repo";
import { CompetitionRepo } from "../repositories/competition/competition-repo";
import { DashboardService } from "./dashboard-service";
import { transformDashboardVotesToResponse } from "../utils/dashboard-transforms";
import prisma from "../repositories/prisma-client";
import { DashboardPlayerRepo } from "../repositories/dashboard-player-repo";
import { PrismaTransaction } from "../types";
import { transformMatchServiceToPendingVotes } from "../utils/votes-transforms";

export class VoteService {
  static async getDashboardVotes(userId: string) {
    const dashboardId = await DashboardService.getDashboardIdFromUserId(userId);

    const competitions = await CompetitionRepo.findByDashboardId(dashboardId, {
      votingEnabled: true,
    });

    if (competitions.length === 0) {
      return [];
    }

    const competitionIds = competitions.map((c) => c.id);
    const matches = await MatchRepo.findByCompetitionIds(competitionIds);

    if (matches.length === 0) {
      return [];
    }

    const matchIds = matches.map((m) => m.id);
    const votes = await VoteRepo.findByMatchIds(matchIds);

    return transformDashboardVotesToResponse(votes);
  }

  static async submitVotes(
    matchId: string,
    voterId: string,
    votes: { playerId: string; points: number }[],
    requestingUserId: string
  ) {
    const match = await MatchRepo.findById(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    if (match.voting_status !== "OPEN") {
      throw new Error("Voting is closed for this match");
    }

    console.log(match.voting_ends_at && match.voting_ends_at < new Date());

    if (match.voting_ends_at && match.voting_ends_at < new Date()) {
      throw new Error("Voting period has expired");
    }

    const isParticipant = await MatchPlayerRepo.isPlayerInMatch(
      voterId,
      matchId
    );
    if (!isParticipant) {
      throw new Error("Voter must be a participant in the match");
    }

    const canVote = await this.canUserSubmitVotesForPlayer(
      matchId,
      voterId,
      requestingUserId
    );
    if (!canVote) {
      throw new Error("Not authorized to submit votes for this player");
    }

    const existingVotes = await VoteRepo.findByVoterAndMatch(voterId, matchId);
    if (existingVotes.length > 0) {
      throw new Error("Player has already voted for this match");
    }

    this.validateVoteData(votes);

    return await prisma.$transaction(async (tx) => {
      const voteData = votes.map((vote) => ({
        match_id: matchId,
        voter_id: voterId,
        match_player_id: vote.playerId,
        points: vote.points,
        created_at: new Date(),
      }));

      await VoteRepo.createMany(voteData, tx);

      await this.checkAndCloseVoting(matchId, tx);

      return { success: true, message: "Votes submitted successfully" };
    });
  }

  static async getVotingStatus(matchId: string, voterId: string) {
    const match = await MatchRepo.findByIdWithDetails(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    const isParticipant = await MatchPlayerRepo.isPlayerInMatch(
      voterId,
      matchId
    );
    if (!isParticipant) {
      throw new Error("Player has not played in this match");
    }

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

  static async getPendingVoters(matchId: string): Promise<string[]> {
    const matchPlayers =
      await MatchPlayerRepo.getMatchPlayersFromMatch(matchId);
    const allPlayerIds = matchPlayers.map((mp) => mp.dashboard_player_id);

    const votedPlayerIds = await VoteRepo.getDistinctVotersByMatch(matchId);

    return allPlayerIds.filter((id) => !votedPlayerIds.includes(id));
  }

  static async hasPlayerVoted(
    voterId: string,
    matchId: string
  ): Promise<boolean> {
    const count = await VoteRepo.countByVoterAndMatch(voterId, matchId);
    return count > 0;
  }

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

  static async getVoterVotes(
    voterId: string,
    options?: { limit?: number; offset?: number }
  ) {
    return await VoteRepo.findByVoterId(voterId, options);
  }

  static async deleteMatchVotes(matchId: string, requestingUserId: string) {
    const canDelete = await this.canUserModifyMatchVotes(
      matchId,
      requestingUserId
    );
    if (!canDelete) {
      throw new Error("Only administrators can delete match votes");
    }

    return await VoteRepo.deleteByMatch(matchId);
  }

  private static async canUserSubmitVotesForPlayer(
    matchId: string,
    voterId: string,
    requestingUserId: string
  ): Promise<boolean> {
    const voterUser = await DashboardPlayerRepo.findById(voterId);
    if (voterUser?.user_id === requestingUserId) {
      return true;
    }

    return await this.canUserModifyMatchVotes(matchId, requestingUserId);
  }

  private static async canUserModifyMatchVotes(
    matchId: string,
    userId: string
  ): Promise<boolean> {
    const match = await MatchRepo.findByIdWithDetails(matchId);
    if (!match) return false;

    const isDashboardAdmin = match.competition.dashboard.admin_id === userId;
    if (isDashboardAdmin) return true;

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
