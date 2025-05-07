import { PrismaClient } from "@prisma/client";

export type AuthResponse = {
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
};

export type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
