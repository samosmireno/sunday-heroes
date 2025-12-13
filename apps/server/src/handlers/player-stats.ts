import { BadRequestError } from "../utils/errors";
import { Request, Response, NextFunction } from "express";
import { DashboardPlayerStatsService } from "../services/dashboard-player-stats-service";
import { sendSuccess } from "../utils/response-utils";

export const getPlayerStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const playerId = req.params.playerId;

    if (!playerId) {
      throw new BadRequestError("Player ID is required");
    }

    const stats = await DashboardPlayerStatsService.getPlayerStats(playerId);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};

export const getTopMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const playerId = req.params.playerId;

    if (!playerId) {
      throw new BadRequestError("Player ID is required");
    }

    const topMatches =
      await DashboardPlayerStatsService.getTopMatches(playerId);
    sendSuccess(res, topMatches);
  } catch (error) {
    next(error);
  }
};

export const getTopCompetitions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const playerId = req.params.playerId;

    if (!playerId) {
      throw new BadRequestError("Player ID is required");
    }

    const topCompetitions =
      await DashboardPlayerStatsService.getTopCompetitions(playerId);
    sendSuccess(res, topCompetitions);
  } catch (error) {
    next(error);
  }
};

export const getPerformanceChart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const playerId = req.params.playerId;
    const competitionId = req.params.competitionId;
    const range = Number(req.query.range);

    if (!playerId || !competitionId) {
      throw new BadRequestError("Player ID and Competition ID are required");
    }

    const performanceChart =
      await DashboardPlayerStatsService.getPerformanceChart(
        playerId,
        competitionId,
        range
      );
    sendSuccess(res, performanceChart);
  } catch (error) {
    next(error);
  }
};

export const getTopTeammates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const playerId = req.params.playerId;

    if (!playerId) {
      throw new BadRequestError("Player ID is required");
    }

    const topTeammates =
      await DashboardPlayerStatsService.getTopTeammates(playerId);
    sendSuccess(res, topTeammates);
  } catch (error) {
    next(error);
  }
};

export const getStatsByCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const playerId = req.params.playerId;

    if (!playerId) {
      throw new BadRequestError("Player ID is required");
    }

    const stats =
      await DashboardPlayerStatsService.getStatsByCompetition(playerId);
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};
