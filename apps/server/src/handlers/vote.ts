import { Request, Response, NextFunction } from "express";
import { VoteService } from "../services/vote-service";
import { z } from "zod";
import { AuthenticatedRequest } from "../types";
import { CompetitionService } from "../services/competition-service";
import { sendError, sendSuccess } from "../utils/response-utils";
import { extractUserId } from "../utils/request-utils";

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

type SubmitVotesRequest = z.infer<typeof submitVotesSchema>;

export const getAllVotesFromDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.query.userId?.toString();
    if (!userId) {
      return sendError(res, "userId query parameter is required", 400);
    }

    const votes = await VoteService.getDashboardVotes(userId);
    sendSuccess(res, votes);
  } catch (error) {
    if (error instanceof Error && error.message.includes("No dashboard")) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

export const submitVotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestingUserId = extractUserId(req);
    const data: SubmitVotesRequest = req.body;

    const validationResult = submitVotesSchema.safeParse(data);
    if (!validationResult.success) {
      return sendError(res, "Invalid vote data", 400);
    }

    const result = await VoteService.submitVotes(
      data.matchId,
      data.voterId,
      data.votes,
      requestingUserId
    );

    sendSuccess(res, result, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      if (
        error.message.includes("closed") ||
        error.message.includes("expired")
      ) {
        return sendError(res, error.message, 400);
      }
      if (error.message.includes("already voted")) {
        return sendError(res, error.message, 409);
      }
      if (error.message.includes("Not authorized")) {
        return sendError(res, error.message, 403);
      }
      if (
        error.message.includes("Must vote") ||
        error.message.includes("Exactly")
      ) {
        return sendError(res, error.message, 400);
      }
    }
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

    if (!matchId) {
      return sendError(res, "matchId parameter is required", 400);
    }
    if (!voterId) {
      return sendError(res, "voterId query parameter is required", 400);
    }

    const status = await VoteService.getVotingStatus(matchId, voterId);
    sendSuccess(res, status);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      if (error.message.includes("not played")) {
        return sendError(res, error.message, 404);
      }
    }
    next(error);
  }
};

export const getPendingVotesForMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const matchId = req.params.matchId;
    if (!matchId) {
      return sendError(res, "matchId parameter is required", 400);
    }

    const votes = await VoteService.getMatchVotes(matchId);
    sendSuccess(res, votes);
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
    if (!competitionId) {
      return sendError(res, "competitionId parameter is required", 400);
    }

    const competition =
      await CompetitionService.getCompetitionWithPendingVotes(competitionId);
    if (!competition) {
      return sendError(res, "Competition not found", 404);
    }

    sendSuccess(res, competition);
  } catch (error) {
    next(error);
  }
};
