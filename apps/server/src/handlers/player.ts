import { DashboardPlayerRepo } from "../repositories/dashboard-player-repo";
import { UserRepo } from "../repositories/user-repo";
import { NextFunction, Request, Response } from "express";

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
