import { Request } from "express";
import { AuthenticatedRequest } from "../types";
import { BadRequestError } from "./errors";

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

export const getOptionalNumberParam = (
  req: Request,
  param: string,
  defaultValue: number,
): number => {
  const value = req.query[param]?.toString();
  return value ? parseInt(value, 10) : defaultValue;
};
