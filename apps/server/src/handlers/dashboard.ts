import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard-service";
import { sendError, sendSuccess } from "../utils/response-utils";
import { extractUserId } from "../utils/request-utils";

export const getDashboardDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return sendError(res, "User ID is required", 400);
    }

    const dashboardResponse =
      await DashboardService.getDashboardForUser(userId);
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
      return sendError(res, "Dashboard name is required", 400);
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
      return sendError(res, "Dashboard ID is required", 400);
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
      return sendError(res, "Dashboard ID is required", 400);
    }

    await DashboardService.deleteDashboard(dashboardId, userId);
    sendSuccess(res, { message: "Dashboard deleted successfully" });
  } catch (error) {
    next(error);
  }
};
