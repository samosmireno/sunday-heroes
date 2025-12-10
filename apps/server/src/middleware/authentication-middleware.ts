import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { AuthenticatedRequest } from "../types";
import {
  AuthenticationError,
  InvalidTokenError,
  TokenExpiredError,
} from "../utils/errors";

export const authenticateToken = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const token = authenticatedReq.cookies["access-token"];

    if (!token) {
      throw new AuthenticationError("Missing token");
    }

    const decoded: any = jwt.verify(token, config.jwt.accessSecret);
    authenticatedReq.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new InvalidTokenError("Invalid or malformed token"));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new TokenExpiredError("Token has expired"));
    }
    next(error);
  }
};
