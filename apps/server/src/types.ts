import { UserResponse } from "@repo/logger";

export type AuthResponse = {
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
};
