import { Request, Response, NextFunction } from "express";
import { VoteService } from "../services/vote-service";
import { z } from "zod";
import { CompetitionService } from "../services/competition-service";
import {
  sendError,
  sendNotFoundError,
  sendSuccess,
  sendValidationError,
} from "../utils/response-utils";
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

export const submitVotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestingUserId = extractUserId(req);
    const data: SubmitVotesRequest = req.body;

    const validation = submitVotesSchema.safeParse(data);
    if (!validation.success) {
      return sendValidationError(res, validation.error);
    }

    const result = await VoteService.submitVotes(
      data.matchId,
      data.voterId,
      data.votes,
      requestingUserId
    );

    sendSuccess(res, result, 201);
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

    if (!matchId) {
      return sendError(res, "matchId parameter is required", 400);
    }
    if (!voterId) {
      return sendError(res, "voterId query parameter is required", 400);
    }

    const status = await VoteService.getVotingStatus(matchId, voterId);
    sendSuccess(res, status);
  } catch (error) {
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
      return sendNotFoundError(res, "Competition");
    }

    sendSuccess(res, competition);
  } catch (error) {
    next(error);
  }
};
