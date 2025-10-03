import { Role } from "./enums";

export type UserResponse = {
  id: string;
  email: string;
  name: string;
  role: Role;
};
