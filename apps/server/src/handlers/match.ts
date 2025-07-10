import { NextFunction, Request, Response } from "express";
import { createMatchRequest } from "@repo/shared-types";
import { MatchService } from "../services/match/match-service";
import { MatchAuthService } from "../services/match/match-auth-service";
import {
  sendAuthError,
  sendError,
  sendNotFoundError,
  sendSuccess,
} from "../utils/response-utils";
import { extractUserId } from "../utils/request-utils";
import { AuthorizationError, BadRequestError } from "../utils/errors";

const getRequiredQuery = (req: Request, param: string): string => {
  const value = req.query[param]?.toString();
  if (!value) {
    throw new Error(`${param} query parameter is required`);
  }
  return value;
};

const getOptionalNumberParam = (
  req: Request,
  param: string,
  defaultValue: number
): number => {
  const value = req.query[param]?.toString();
  return value ? parseInt(value, 10) : defaultValue;
};

export const getAllMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const matches = await MatchService.getAllMatches();
    sendSuccess(res, matches);
  } catch (error) {
    next(error);
  }
};

export const getMatchById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const matchId = req.params.id;
    if (!matchId) {
      return sendError(res, "Match ID is required", 400);
    }

    const match = await MatchService.getMatchById(matchId);
    if (!match) {
      return sendNotFoundError(res, "Match");
    }

    sendSuccess(res, match);
  } catch (error) {
    next(error);
  }
};

export const getAllMatchesFromDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getRequiredQuery(req, "userId");
    const matches = await MatchService.getDashboardMatches(userId);
    sendSuccess(res, matches);
  } catch (error) {
    next(error);
  }
};

export const getAllMatchesFromCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const competitionId = getRequiredQuery(req, "competitionId");
    const matches = await MatchService.getCompetitionMatches(competitionId);
    sendSuccess(res, matches);
  } catch (error) {
    next(error);
  }
};

export const getMatchesWithStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getRequiredQuery(req, "userId");
    const page = getOptionalNumberParam(req, "page", 1);
    const limit = getOptionalNumberParam(req, "limit", 8);
    const competitionId = req.query.competitionId?.toString();

    const result = await MatchService.getMatchesForUser(userId, {
      competitionId,
      limit,
      offset: (page - 1) * limit,
    });

    res.setHeader("X-Total-Count", result.totalCount.toString());
    res.setHeader("X-Total-Pages", result.totalPages.toString());
    res.setHeader("X-Current-Page", page.toString());

    sendSuccess(res, result.matches);
  } catch (error) {
    next(error);
  }
};

export const createMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = extractUserId(req);
    const data: createMatchRequest = req.body;

    if (!data.competitionId) {
      throw new BadRequestError("Competition ID is required");
    }

    const isAuthorized = await MatchAuthService.canUserCreateMatch(
      data.competitionId,
      userId
    );

    if (!isAuthorized) {
      throw new AuthorizationError(
        "User is not authorized to create a match in this competition"
      );
    }

    const match = await MatchService.createMatch(data);
    sendSuccess(res, match, 201);
  } catch (error) {
    next(error);
  }
};

export const updateMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = extractUserId(req);
    const matchId = req.params.id;
    const data: createMatchRequest = req.body;

    if (!matchId) {
      throw new BadRequestError("Match ID is required");
    }

    if (!data.competitionId) {
      throw new BadRequestError("Competition ID is required");
    }

    const isAuthorized = await MatchAuthService.canUserModifyMatch(
      matchId,
      userId
    );

    if (!isAuthorized) {
      throw new AuthorizationError(
        "User is not authorized to update this match"
      );
    }

    const updatedMatch = await MatchService.updateMatch(matchId, data);
    sendSuccess(res, updatedMatch);
  } catch (error) {
    next(error);
  }
};

export const deleteMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = extractUserId(req);
    const matchId = req.params.id;

    if (!matchId) {
      throw new BadRequestError("Match ID is required");
    }

    const isAuthorized = await MatchAuthService.canUserModifyMatch(
      matchId,
      userId
    );

    if (!isAuthorized) {
      throw new AuthorizationError(
        "User is not authorized to delete this match"
      );
    }

    const deletedMatch = await MatchService.deleteMatch(matchId);

    if (!deletedMatch) {
      throw new BadRequestError("Match not found or already deleted");
    }

    sendSuccess(res, { message: "Match deleted successfully" });
  } catch (error) {
    next(error);
  }
};
