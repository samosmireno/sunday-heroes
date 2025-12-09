import { Request, Response, NextFunction } from "express";
import { VoteService } from "../services/vote-service";
import { z } from "zod";
import { sendSuccess } from "../utils/response-utils";
import { extractUserId, getRequiredQuery } from "../utils/request-utils";
import { BadRequestError, ValidationError } from "../utils/errors";

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
      const fields = validation.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      }));
      throw new ValidationError(fields);
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
      throw new BadRequestError("matchId parameter is required");
    }
    if (!voterId) {
      throw new BadRequestError("voterId query parameter is required");
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
    const matchId = getRequiredQuery(req, "matchId");
    const userId = getRequiredQuery(req, "userId");

    const votes = await VoteService.getMatchVotes(matchId, userId);
    sendSuccess(res, votes);
  } catch (error) {
    next(error);
  }
};
