import { Request, Response, NextFunction } from "express";
import { DashboardResponse } from "@repo/logger";
import { DashboardRepo } from "../repositories/dashboard-repo";
import { transformDashboardServiceToResponse } from "../utils/utils";

export const getDashboardDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const dashboard = await DashboardRepo.getDashboardDetails(req.params.id);
  if (dashboard) {
    const dashboardResponse: DashboardResponse =
      transformDashboardServiceToResponse(dashboard);
    res.json(dashboardResponse);
  } else {
    res.status(404).send("Dashboard not found");
  }
};
