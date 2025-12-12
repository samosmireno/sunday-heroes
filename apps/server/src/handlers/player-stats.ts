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
