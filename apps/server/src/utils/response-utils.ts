import { Response } from "express";
import { ZodError } from "zod";
import { ErrorResponse, ValidationErrorResponse } from "@repo/shared-types";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200
): void => {
  res.status(statusCode).json(data);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  details?: any,
  code?: string
): void => {
  const errorResponse: ErrorResponse = {
    error: message,
    ...(details && { details }),
    ...(code && { code }),
  };
  res.status(statusCode).json(errorResponse);
};

export const sendValidationError = (
  res: Response,
  error: ZodError,
  statusCode = 400
): void => {
  const validationErrors = error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
    code: err.code,
  }));

  const errorResponse: ValidationErrorResponse = {
    error: "Validation failed",
    validation_errors: validationErrors,
  };

  res.status(statusCode).json(errorResponse);
};
