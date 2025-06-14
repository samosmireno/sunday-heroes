import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { sendError, sendValidationError } from "../utils/response-utils";

export const validateRequestBody =
  (schema: z.ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (e) {
      if (e instanceof z.ZodError) {
        return sendValidationError(res, e);
      }
      return sendError(res, "Invalid request", 400);
    }
  };

export const validateQuery =
  (schema: z.ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (e) {
      if (e instanceof z.ZodError) {
        return sendValidationError(res, e);
      }
      return sendError(res, "Invalid query parameters", 400);
    }
  };
