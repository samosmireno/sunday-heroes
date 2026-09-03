import { Request } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../types";
import { BadRequestError, ValidationError } from "./errors";

export const extractUserId = (req: Request): string => {
  const authenticatedReq = req as AuthenticatedRequest;
  if (!authenticatedReq.userId) {
    throw new BadRequestError("User ID is required for this operation");
  }
  return authenticatedReq.userId;
};

export const getRequiredQuery = (req: Request, param: string): string => {
  const value = req.query[param]?.toString();
  if (!value) {
    throw new BadRequestError(`Missing required query parameter: ${param}`);
  }
  return value;
};

/** Parses the query string against a schema; a failure is the 400 validation error. */
export const parseQuery = <T>(
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  query: unknown,
): T => {
  const result = schema.safeParse(query);
  if (!result.success) {
    throw new ValidationError(
      result.error.errors.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    );
  }
  return result.data;
};

export const getOptionalNumberParam = (
  req: Request,
  param: string,
  defaultValue: number,
): number => {
  const value = req.query[param]?.toString();
  return value ? parseInt(value, 10) : defaultValue;
};
