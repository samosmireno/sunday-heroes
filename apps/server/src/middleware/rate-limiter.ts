import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req: Request, res: Response) => {
    return res.status(429).json({
      message: "Too many login attempts, please try again after 15 minutes",
    });
  },
});
