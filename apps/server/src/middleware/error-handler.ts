import { Request, Response, NextFunction } from "express";
import { config } from "../config/config";
import {
  AppError,
  NotFoundError,
  UncaughtError,
  ValidationError,
} from "../utils/errors";

interface ErrorResponse {
  code: number;
  message: string;
  stack?: string;
  validation_errors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  resource?: string;
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else {
    error = new UncaughtError();
  }

  let { statusCode, message } = error;

  if (config.env === "production" && !error.isOperational) {
    statusCode = 500;
    message = "Internal Server Error";
  }

  req.log.error(
    {
      err,
      errorName: error.name,
      statusCode,
      isOperational: error.isOperational,
    },
    "Request failed",
  );

  const response: ErrorResponse = {
    code: statusCode,
    message,
  };

  if (config.env === "development") {
    response.stack = err instanceof Error ? err.stack : undefined;
  }

  if (error.isOperational) {
    if (error instanceof ValidationError) {
      response.validation_errors = error.fields;
    } else if (error instanceof NotFoundError) {
      response.resource = error.resource;
    }
  }

  res.status(statusCode).send(response);
};
