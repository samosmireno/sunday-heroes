import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard-service";
import { sendSuccess } from "../utils/response-utils";
import { extractUserId } from "../utils/request-utils";
import { BadRequestError, ValidationError } from "../utils/errors";

export const getDashboardDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      throw new BadRequestError("User ID is required");
    }

    const dashboardResponse =
      await DashboardService.getDashboardPlayerDetailsForUser(userId);
    sendSuccess(res, dashboardResponse);
  } catch (error) {
    next(error);
  }
};

export const createDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    const { name } = req.body;

    if (!name) {
      throw new ValidationError([
        {
          field: "name",
          message: "Dashboard name is required",
          code: "REQUIRED",
        },
      ]);
    }

    const dashboard = await DashboardService.createDashboard(userId, name);
    sendSuccess(res, dashboard, 201);
  } catch (error) {
    next(error);
  }
};

export const updateDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    const dashboardId = req.params.id;
    const { name } = req.body;

    if (!dashboardId) {
      throw new BadRequestError("Dashboard ID is required");
    }

    const dashboard = await DashboardService.updateDashboard(
      dashboardId,
      userId,
      { name }
    );
    sendSuccess(res, dashboard);
  } catch (error) {
    next(error);
  }
};

export const deleteDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    const dashboardId = req.params.id;

    if (!dashboardId) {
      throw new BadRequestError("Dashboard ID is required");
    }

    await DashboardService.deleteDashboard(dashboardId, userId);
    sendSuccess(res, { message: "Dashboard deleted successfully" });
  } catch (error) {
    next(error);
  }
};
