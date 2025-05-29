import { DashboardPlayerRepo } from "../repositories/dashboard-player-repo";
import { UserRepo } from "../repositories/user-repo";
import { NextFunction, Request, Response } from "express";
import { transformDashboardPlayersToResponse } from "../utils/utils";

export const getAllDashboardPlayers = async (
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

    const query = req.query.query as string;
    let players;

    if (query && dashboardId) {
      players = await DashboardPlayerRepo.getDashboardPlayersByQuery(
        query,
        dashboardId
      );
    } else {
      players = await UserRepo.getAllUsers();
    }

    res.json(players);
  } catch (error) {
    next(error);
  }
};

export const getAllDashboardPlayersWithDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.query.userId?.toString();
    if (!userId) {
      return res.status(400).send("userId query parameter is required");
    }

    const page = parseInt(req.query.page?.toString() || "0", 10);
    const limit = parseInt(req.query.limit?.toString() || "0", 10);
    const search = req.query.search?.toString();

    const dashboardId = await UserRepo.getDashboardIdFromUserId(userId);
    if (!dashboardId) {
      return res.status(400).send("No dashboard for the given userId");
    }
    const dashPlayers =
      await DashboardPlayerRepo.getDashboardPlayersByDashboardId(
        dashboardId,
        page,
        limit,
        search
      );

    const totalCount =
      await DashboardPlayerRepo.getNumDashboardPlayersFromQuery(
        dashboardId,
        search
      );

    res.setHeader("X-Total-Count", totalCount.toString());

    const players = transformDashboardPlayersToResponse(dashPlayers);
    res.json(players);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const player = await UserRepo.getUserById(req.params.id);
    if (player) {
      res.json(player);
    } else {
      res.status(404).send("Player not found");
    }
  } catch (error) {
    next(error);
  }
};
