import { PrismaClient } from "@prisma/client";
import { Request } from "express";

export type AuthResponse = {
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
};

export interface AuthenticatedRequest extends Request {
  userId: string;
  dashboardId?: string;
}

export type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
