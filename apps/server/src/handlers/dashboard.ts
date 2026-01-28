import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard-service";
import { sendSuccess } from "../utils/response-utils";
import { extractUserId } from "../utils/request-utils";
import { BadRequestError, ValidationError } from "../utils/errors";
import logger from "../logger";

export const getDashboardDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
  next: NextFunction,
) => {
  try {
    const userId = extractUserId(req);
    const { name } = req.body;

    logger.info({ userId, name }, "Create dashboard attempt");

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

    logger.info({ userId, dashboardId: dashboard.id }, "Dashboard created");
    sendSuccess(res, dashboard, 201);
  } catch (error) {
    next(error);
  }
};
