import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user-service";
import { Role } from "@prisma/client";
import { sendSuccess } from "../utils/response-utils";
import { extractUserId } from "../utils/request-utils";
import { BadRequestError } from "../utils/errors";
import logger from "../logger";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const role = req.query.role as Role;
    const users = await UserService.getAllUsers({ role });
    sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      throw new BadRequestError("User ID is required");
    }

    const user = await UserService.getUserById(userId);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requestingUserId = extractUserId(req);
    const userId = req.params.id;
    const updateData = req.body;

    logger.info({ userId }, "Update user attempt");

    if (!userId) {
      throw new BadRequestError("User ID is required");
    }

    const user = await UserService.updateUser(
      userId,
      requestingUserId,
      updateData,
    );

    logger.info({ userId }, "User updated");
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requestingUserId = extractUserId(req);
    const userId = req.params.id;

    logger.info({ userId }, "Delete user attempt");

    if (!userId) {
      throw new BadRequestError("User ID is required");
    }

    await UserService.deleteUser(userId, requestingUserId);

    logger.info({ userId }, "User deleted");
    sendSuccess(res, { message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
