import { Response } from "express";
import { ZodError } from "zod";

export interface ErrorResponse {
  error: string;
  details?: any;
  code?: string;
}

export interface ValidationErrorResponse {
  error: string;
  validation_errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

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

export const sendAuthError = (
  res: Response,
  message: string = "Authentication required",
  statusCode = 401
): void => {
  res.status(statusCode).json({
    error: message,
    code: "AUTH_ERROR",
  });
};

export const sendForbiddenError = (
  res: Response,
  message: string = "Access forbidden",
  resource?: string
): void => {
  res.status(403).json({
    error: message,
    code: "FORBIDDEN",
    ...(resource && { resource }),
  });
};

export const sendNotFoundError = (
  res: Response,
  resource: string = "Resource"
): void => {
  res.status(404).json({
    error: `${resource} not found`,
    code: "NOT_FOUND",
    resource: resource.toLowerCase(),
  });
};
