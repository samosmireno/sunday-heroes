import { Role } from "./enums";

export type UserResponse = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type RegisterRequest = {
  email: string;
  name: string;
  password: string;
  inviteToken?: string;
};

export type RegisterResponse = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type LoginRequest = {
  email: string;
  password: string;
  inviteToken?: string;
};

export type LoginResponse = {
  id: string;
  email: string;
  name: string;
  role: Role;
};
