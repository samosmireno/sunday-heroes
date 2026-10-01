import { Request, Response } from "express";
import { StatusResponse } from "@repo/shared-types";
import { config } from "../config/config";
import { sendSuccess } from "../utils/response-utils";

/** Unauthenticated, so the client can show the read-only banner to anyone. */
export const getStatus = (_req: Request, res: Response) => {
  const status: StatusResponse = { readOnly: config.readOnly };
  sendSuccess(res, status);
};
