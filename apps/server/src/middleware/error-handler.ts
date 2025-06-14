import { Request, Response, NextFunction } from "express";
import {
  sendError,
  sendNotFoundError,
  sendValidationError,
} from "../utils/response-utils";
import { ZodError } from "zod";

export interface IAppError extends Error {
  statusCode: number;
  code?: string;
  details?: any;
}

function errorHandler(
  err: IAppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    code: err.code,
  });

  if (err instanceof ZodError) {
    return sendValidationError(res, err);
  }

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.details, err.code);
  }

  if (err.message.includes("Foreign key constraint")) {
    return sendError(
      res,
      "Referenced resource does not exist",
      400,
      undefined,
      "FOREIGN_KEY_ERROR"
    );
  }

  if (err.message.includes("Unique constraint")) {
    return sendError(
      res,
      "Resource already exists",
      409,
      undefined,
      "DUPLICATE_ERROR"
    );
  }

  if (err.message.includes("Record to update not found")) {
    return sendNotFoundError(res, "Resource");
  }

  if (process.env.NODE_ENV === "production" && err.statusCode === 500) {
    return sendError(
      res,
      "Internal server error",
      500,
      undefined,
      "INTERNAL_ERROR"
    );
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  sendError(res, message, statusCode, err.details, err.code);
}

export default errorHandler;

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const createValidationError = (message: string, details?: any) =>
  new AppError(message, 400, "VALIDATION_ERROR", details);

export const createNotFoundError = (resource: string) =>
  new AppError(`${resource} not found`, 404, "NOT_FOUND", { resource });

export const createUnauthorizedError = (message?: string) =>
  new AppError(message || "Authentication required", 401, "UNAUTHORIZED");

export const createForbiddenError = (message?: string) =>
  new AppError(message || "Access forbidden", 403, "FORBIDDEN");
