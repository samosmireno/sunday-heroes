import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const token = authenticatedReq.cookies["access-token"];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  try {
    const decoded: any = jwt.verify(token, config.jwt.accessSecret);
    authenticatedReq.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Forbidden: Invalid token" });
  }
};
