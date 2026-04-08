import { Request, Response, NextFunction } from "express";
import { VoteService } from "../services/vote-service";
import { sendSuccess } from "../utils/response-utils";
import { extractUserId, getRequiredQuery } from "../utils/request-utils";
import { BadRequestError } from "../utils/errors";
import { SubmitVotesRequest } from "../schemas/vote-schemas";
import logger from "../logger";

export const submitVotes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requestingUserId = extractUserId(req);
    const data: SubmitVotesRequest = req.body;

    logger.info(
      { requestingUserId, matchId: data.matchId, voterId: data.voterId },
      "Submit votes attempt",
    );

    const result = await VoteService.submitVotes(
      data.matchId,
      data.voterId,
      data.votes,
      requestingUserId,
    );

    logger.info(
      { requestingUserId, matchId: data.matchId, voterId: data.voterId },
      "Votes submitted",
    );
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
};

export const getVotingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const matchId = req.params.matchId;
    const voterId = getRequiredQuery(req, "voterId");

    if (!matchId) {
      throw new BadRequestError("matchId parameter is required");
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
  next: NextFunction,
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
