import { Request, Response, NextFunction } from "express";
import { DashboardResponse } from "@repo/logger";
import { DashboardRepo } from "../repositories/dashboard-repo";
import { transformDashboardServiceToResponse } from "../utils/utils";
import { UserRepo } from "../repositories/user-repo";

export const getDashboardDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).send("userId query parameter is required");
  }
  const dashboardId = await UserRepo.getDashboardIdFromUserId(userId);
  if (!dashboardId) {
    return res.status(400).send("No dashboard for the given userId");
  }

  const dashboard = await DashboardRepo.getDashboardDetails(dashboardId);
  if (dashboard) {
    const dashboardResponse: DashboardResponse =
      transformDashboardServiceToResponse(dashboard);
    res.json(dashboardResponse);
  } else {
    res.status(404).send("Dashboard not found");
  }
};
