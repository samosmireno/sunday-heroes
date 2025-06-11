import { Request } from "express";
import { AuthenticatedRequest } from "../types";

export const extractUserId = (req: Request): string => {
  const authenticatedReq = req as AuthenticatedRequest;
  if (!authenticatedReq.userId) {
    throw new Error("User ID not found in request");
  }
  return authenticatedReq.userId;
};
