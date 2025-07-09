import { Request, Response, NextFunction } from "express";
import { config } from "../config/config";
import {
  AppError,
  DatabaseError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: AppError;

  if (!(err instanceof AppError)) {
    error = new DatabaseError("An unexpected error occurred");
  } else {
    error = err;
  }

  let { statusCode, message } = error;
  if (config.env === "production" && !error.isOperational) {
    statusCode = 500;
    message = "Internal Server Error";
  }

  res.locals.errorMessage = error.message;

  const response: any = {
    code: statusCode,
    message,
    ...(config.env === "development" && { stack: err.stack }),
  };

  if (error.isOperational) {
    if (error instanceof ValidationError) {
      response.validation_errors = error.fields;
    } else if (error instanceof NotFoundError) {
      response.resource = error.resource;
    }
  }

  if (config.env === "development") {
    console.error(err);
  }

  res.status(statusCode).send(response);
};
