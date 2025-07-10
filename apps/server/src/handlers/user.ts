import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user-service";
import { Role } from "@prisma/client";
import { sendError, sendSuccess } from "../utils/response-utils";
import { extractUserId } from "../utils/request-utils";
import { BadRequestError, ValidationError } from "../utils/errors";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
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
  next: NextFunction
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

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, given_name, family_name, role } = req.body;

    //TODO: Add validation for email format and required fields

    const user = await UserService.createUser({
      email,
      given_name,
      family_name,
      role,
    });

    sendSuccess(res, user, 201);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestingUserId = extractUserId(req);
    const userId = req.params.id;
    const updateData = req.body;

    if (!userId) {
      throw new BadRequestError("User ID is required");
    }

    const user = await UserService.updateUser(
      userId,
      requestingUserId,
      updateData
    );
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestingUserId = extractUserId(req);
    const userId = req.params.id;

    if (!userId) {
      throw new BadRequestError("User ID is required");
    }

    await UserService.deleteUser(userId, requestingUserId);
    sendSuccess(res, { message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
