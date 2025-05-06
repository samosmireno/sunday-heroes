import { Request, Response, NextFunction } from "express";
import { VoteRepo } from "../repositories/vote-repo";
import {
  transformCompetitionServiceToPendingVotes,
  transformDashboardVotesToResponse,
} from "../utils/utils";
import { UserRepo } from "../repositories/user-repo";
import { z } from "zod";
import { MatchPlayerRepo } from "../repositories/match-player-repo";
import { MatchRepo } from "../repositories/match-repo";
import { VotingStatus } from "@prisma/client";
import {
  CompetitionRepo,
  CompetitionWithDetails,
  CompetitionWithPendingVotes,
} from "../repositories/competition-repo";

export const submitVotesSchema = z.object({
  matchId: z.string(),
  voterId: z.string(),
  votes: z
    .array(
      z.object({
        playerId: z.string(),
        points: z.coerce.number().min(1).max(3),
      })
    )
    .length(3),
});

type submitVotesReques = z.infer<typeof submitVotesSchema>;

async function checkAndCloseVoting(matchId: string): Promise<void> {
  const pendingVoters = await VoteRepo.getPendingVoters(matchId);

  if (pendingVoters.length === 0) {
    await MatchRepo.updateMatchVotingStatus(
      matchId,
      VotingStatus.CLOSED,
      new Date()
    );
  }
}

export const getAllVotesFromDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.query.userId?.toString();
    if (!userId) {
      return res.status(400).send("userId query parameter is required");
    }

    const dashboardId = await UserRepo.getDashboardIdFromUserId(userId);
    if (!dashboardId) {
      return res.status(400).send("No dashboard for the given userId");
    }

    const votes = await VoteRepo.getAllVotesFromDashboard(dashboardId);
    res.json(transformDashboardVotesToResponse(votes));
  } catch (error) {
    next(error);
  }
};

export const submitVotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data: submitVotesReques = req.body;

    const isMatchParticipant = await MatchPlayerRepo.isPlayerInMatch(
      data.voterId,
      data.matchId
    );

    if (!isMatchParticipant) {
      return res.status(403).send("Only match participants can vote");
    }

    const match = await MatchRepo.getMatchById(data.matchId);
    if (!match || match.voting_status === "CLOSED") {
      return res.status(400).send("Voting is closed for this match");
    }

    const existingVotes = await VoteRepo.getVotesByVoterAndMatch(
      data.voterId,
      data.matchId
    );
    if (existingVotes.length > 0) {
      return res.status(400).send("You have already voted for this match");
    }

    await VoteRepo.createVotes(data.matchId, data.voterId, data.votes);

    await checkAndCloseVoting(data.matchId);

    res.status(201).send("VOtes submitted successfully");
  } catch (error) {
    next(error);
  }
};

export const getVotingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const matchId = req.params.matchId;
    const voterId = req.query.voterId?.toString();
    console.log(matchId);
    console.log(voterId);
    if (!voterId) {
      return res.status(400).send("voterId query parameter is required");
    }

    const match = await MatchRepo.getMatchWithPlayersById(matchId);
    if (!match) {
      return res.status(404).send("Match not found");
    }

    const playerInMatch = await MatchPlayerRepo.isPlayerInMatch(
      voterId,
      matchId
    );

    if (!playerInMatch) {
      return res.status(404).send("The player has not played in this match");
    }

    const hasVoted = await VoteRepo.hasPlayerVoted(voterId, matchId);

    res.json({
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
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingVotesForCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const competitionId = req.params.competitionId;

    const competition: CompetitionWithPendingVotes | null =
      await CompetitionRepo.getCompetitionWithPendingVotes(competitionId);
    if (!competition) {
      return res.status(404).send("Competition not found");
    }

    const competitionVotes =
      transformCompetitionServiceToPendingVotes(competition);

    res.json(competitionVotes);
  } catch (error) {
    next(error);
  }
};
