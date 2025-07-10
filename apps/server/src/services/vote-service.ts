import { VoteRepo } from "../repositories/vote-repo";
import { MatchRepo } from "../repositories/match-repo";
import { MatchPlayerRepo } from "../repositories/match-player-repo";
import prisma from "../repositories/prisma-client";
import { DashboardPlayerRepo } from "../repositories/dashboard-player-repo";
import { PrismaTransaction } from "../types";
import { transformMatchServiceToPendingVotes } from "../utils/votes-transforms";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  VotingError,
} from "../utils/errors";

export class VoteService {
  static async submitVotes(
    matchId: string,
    voterId: string,
    votes: { playerId: string; points: number }[],
    requestingUserId: string
  ) {
    const match = await MatchRepo.findById(matchId);
    if (!match) {
      throw new NotFoundError("Match");
    }

    if (match.voting_status !== "OPEN") {
      throw new VotingError(
        "Voting is not open for this match. Please check the match details."
      );
    }

    console.log(match.voting_ends_at && match.voting_ends_at < new Date());

    if (match.voting_ends_at && match.voting_ends_at < new Date()) {
      throw new VotingError(
        "Voting has ended for this match. You cannot submit votes."
      );
    }

    const isParticipant = await MatchPlayerRepo.isPlayerInMatch(
      voterId,
      matchId
    );
    if (!isParticipant) {
      throw new VotingError(
        "You have not played in this match. Only players who participated can vote."
      );
    }

    const canVote = await this.canUserSubmitVotesForPlayer(
      matchId,
      voterId,
      requestingUserId
    );
    if (!canVote) {
      throw new AuthorizationError(
        "You are not authorized to submit votes for this player"
      );
    }

    const existingVotes = await VoteRepo.findByVoterAndMatch(voterId, matchId);
    if (existingVotes.length > 0) {
      throw new VotingError(
        "You have already submitted votes for this match. You cannot vote again."
      );
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
      throw new NotFoundError("Match not found");
    }

    const isParticipant = await MatchPlayerRepo.isPlayerInMatch(
      voterId,
      matchId
    );
    if (!isParticipant) {
      throw new VotingError(
        "You have not played in this match. Only players who participated can vote."
      );
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
      throw new NotFoundError("Match not found");
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
      throw new AuthorizationError(
        "You are not authorized to delete votes for this match"
      );
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
      throw new VotingError("You must vote for exactly 3 players");
    }

    const points = votes.map((v) => v.points).sort((a, b) => b - a);
    if (points[0] !== 3 || points[1] !== 2 || points[2] !== 1) {
      throw new VotingError(
        "Votes must be 3, 2, and 1 points for the top three players"
      );
    }

    const playerIds = votes.map((v) => v.playerId);
    const uniquePlayerIds = [...new Set(playerIds)];
    if (uniquePlayerIds.length !== 3) {
      throw new VotingError(
        "You cannot vote for the same player multiple times"
      );
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
