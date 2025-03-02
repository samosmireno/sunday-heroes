import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies["access-token"];

  jwt.verify(token, config.jwt.accessSecret, (err: any, user: any) => {
    if (err) {
      res.status(401).send("Invalid token");
    }

    req.user = user;
    next();
  });
};
