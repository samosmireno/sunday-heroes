import { Request, Response, NextFunction } from "express";
import { CompetitionRepo } from "../repositories/competition-repo";
import { transformDashboardCompetitionsToResponse } from "../utils/utils";

export const getAllCompetitionsFromDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dashboardId = req.query.dashboardId?.toString();
    if (!dashboardId) {
      return res.status(400).send("dashboardId query parameter is required");
    }
    const competitions =
      await CompetitionRepo.getAllCompetitionsFromDashboard(dashboardId);
    res.json(transformDashboardCompetitionsToResponse(competitions));
  } catch (error) {
    next(error);
  }
};
