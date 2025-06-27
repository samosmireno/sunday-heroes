import { Request, Response, NextFunction } from "express";
import { LeagueService } from "../services/league-service";
import { extractUserId } from "../utils/request-utils";
import {
  sendError,
  sendSuccess,
  sendAuthError,
  sendNotFoundError,
} from "../utils/response-utils";
import { CreateLeagueRequest } from "../schemas/league-schemas";
import { TeamService } from "../services/team-service";
import { transformLeagueFixtureToResponse } from "../utils/league-transforms";

export const createLeague = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.body.userId; //extractUserId(req);
    if (!userId) {
      return sendAuthError(res);
    }
    const data: CreateLeagueRequest = req.body;

    const league = await LeagueService.createLeague(data, userId);

    sendSuccess(res, league, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not authorized")) {
        console.error("Not authorized:", error.message);
        return sendAuthError(res);
      }
      if (error.message.includes("already exists")) {
        return sendError(res, error.message, 409);
      }
    }
    next(error);
  }
};

export const getLeagueStandings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const competitionId = req.params.id;

    if (!competitionId) {
      return sendError(res, "Competition ID is required", 400);
    }

    const standings = await LeagueService.getLeagueStandings(competitionId);

    sendSuccess(res, standings);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not authorized")) {
        return sendAuthError(res);
      }
      if (error.message.includes("not found")) {
        return sendNotFoundError(res, "League");
      }
    }
    next(error);
  }
};

export const getLeagueFixtures = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const competitionId = req.params.id;

    if (!competitionId) {
      return sendError(res, "Competition ID is required", 400);
    }

    const fixtures = await LeagueService.getLeagueFixtures(competitionId);
    const fixtureResponse: Record<number, any[]> =
      transformLeagueFixtureToResponse(fixtures);

    sendSuccess(res, fixtureResponse);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not authorized")) {
        return sendAuthError(res);
      }
      if (error.message.includes("not found")) {
        return sendNotFoundError(res, "League");
      }
    }
    next(error);
  }
};

export const getLeagueTeams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const competitionId = req.params.id;

    if (!competitionId) {
      return sendError(res, "Competition ID is required", 400);
    }

    const teams = await LeagueService.getLeagueTeams(competitionId);
    sendSuccess(res, teams);
  } catch (error) {
    next(error);
  }
};

export const getPlayerStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const competitionId = req.params.id;

    if (!competitionId) {
      return sendError(res, "Competition ID is required", 400);
    }

    const stats = await LeagueService.getPlayerStats(competitionId);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};

export const addTeamToLeague = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    const competitionId = req.params.id;
    const { teamName } = req.body;

    if (!competitionId || !teamName) {
      return sendError(res, "Competition ID and team name are required", 400);
    }

    const team = await TeamService.createTeamInCompetition(
      teamName,
      competitionId,
      userId
    );
    sendSuccess(res, team, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not authorized")) {
        return sendAuthError(res);
      }
      if (error.message.includes("already exists")) {
        return sendError(res, error.message, 409);
      }
    }
    next(error);
  }
};

export const updateTeamNames = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    const competitionId = req.params.id;
    const { teamUpdates } = req.body;

    if (!competitionId || !teamUpdates || !Array.isArray(teamUpdates)) {
      return sendError(
        res,
        "Competition ID and team updates array are required",
        400
      );
    }

    for (const update of teamUpdates) {
      if (!update.id || !update.name || typeof update.name !== "string") {
        return sendError(res, "Each team update must have id and name", 400);
      }
    }

    const result = await LeagueService.updateTeamNames(
      competitionId,
      teamUpdates,
      userId
    );
    sendSuccess(res, result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not authorized")) {
        return sendAuthError(res);
      }
      if (error.message.includes("not found")) {
        return sendNotFoundError(res, "League");
      }
      if (error.message.includes("already exists")) {
        return sendError(res, error.message, 409);
      }
    }
    next(error);
  }
};

export const completeLeagueMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    const matchId = req.params.matchId;

    const result = await LeagueService.completeMatch(matchId, userId);
    sendSuccess(res, result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not authorized")) {
        return sendAuthError(res);
      }
      if (error.message.includes("already completed")) {
        return sendError(res, error.message, 409);
      }
    }
    next(error);
  }
};
