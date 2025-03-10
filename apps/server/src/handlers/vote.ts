import { Request, Response, NextFunction } from "express";
import { VoteRepo } from "../repositories/vote-repo";
import { transformDashboardVotesToResponse } from "../utils/utils";

export const getAllVotesFromDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dashboardId = req.query.dashboardId?.toString();
    if (!dashboardId) {
      return res.status(400).send("dashboardId query parameter is required");
    }
    const votes = await VoteRepo.getAllVotesFromDashboard(dashboardId);
    res.json(transformDashboardVotesToResponse(votes));
  } catch (error) {
    next(error);
  }
};
