import { Request, Response, NextFunction } from "express";
import { VoteRepo } from "../repositories/vote-repo";
import { transformDashboardVotesToResponse } from "../utils/utils";
import { UserRepo } from "../repositories/user-repo";

export const getAllVotesFromDashboard = async (
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

    const votes = await VoteRepo.getAllVotesFromDashboard(dashboardId);
    res.json(transformDashboardVotesToResponse(votes));
  } catch (error) {
    next(error);
  }
};
