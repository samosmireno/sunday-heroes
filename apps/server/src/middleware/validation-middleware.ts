import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateRequestBody =
  (schema: z.ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.status(400).json({ message: "Invalid request" });
      }
      return;
    }
  };
