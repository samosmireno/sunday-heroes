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
