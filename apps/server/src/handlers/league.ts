import { Request, Response, NextFunction } from "express";
import { LeagueService } from "../services/league-service";
import { extractUserId } from "../utils/request-utils";
import { sendSuccess } from "../utils/response-utils";
import { CreateLeagueRequest } from "../schemas/league-schemas";
import { TeamService } from "../services/team-service";
import { transformLeagueFixtureToResponse } from "../utils/league-transforms";
import { BadRequestError } from "../utils/errors";

export const createLeague = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      throw new BadRequestError("User ID is required");
    }
    const data: CreateLeagueRequest = req.body;

    const league = await LeagueService.createLeague(data, userId);

    sendSuccess(res, league, 201);
  } catch (error) {
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
      throw new BadRequestError("Competition ID is required");
    }

    const standings = await LeagueService.getLeagueStandings(competitionId);

    sendSuccess(res, standings);
  } catch (error) {
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
      throw new BadRequestError("Competition ID is required");
    }

    const fixtures = await LeagueService.getLeagueFixtures(competitionId);
    const fixtureResponse: Record<number, any[]> =
      transformLeagueFixtureToResponse(fixtures);

    sendSuccess(res, fixtureResponse);
  } catch (error) {
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
      throw new BadRequestError("Competition ID is required");
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
      throw new BadRequestError("Competition ID is required");
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
      throw new BadRequestError("Competition ID and team name are required");
    }

    const team = await TeamService.createTeamInCompetition(
      teamName,
      competitionId,
      userId
    );
    sendSuccess(res, team, 201);
  } catch (error) {
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
      throw new BadRequestError(
        "Competition ID and team updates are required and team updates must be an array"
      );
    }

    for (const update of teamUpdates) {
      throw new BadRequestError(
        "Each team update must contain teamId and newName"
      );
    }

    const result = await LeagueService.updateTeamNames(
      competitionId,
      teamUpdates,
      userId
    );
    sendSuccess(res, result);
  } catch (error) {
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
    next(error);
  }
};
