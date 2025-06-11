import { User, Role, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";

// Define reusable include patterns (DRY principle)
const USER_WITH_DASHBOARD_INCLUDE = {
  dashboard: true,
} satisfies Prisma.UserInclude;

// Type definitions using the includes
export type UserWithDashboard = Prisma.UserGetPayload<{
  include: typeof USER_WITH_DASHBOARD_INCLUDE;
}>;

export class UserRepo {
  // BASIC CRUD OPERATIONS
  static async findById(
    id: string,
    tx?: PrismaTransaction
  ): Promise<User | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.findUnique({ where: { id } });
    } catch (error) {
      console.error("Error in UserRepo.findById:", error);
      throw new Error("Failed to fetch user");
    }
  }

  static async findByIdWithDashboard(
    id: string,
    tx?: PrismaTransaction
  ): Promise<UserWithDashboard | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.findUnique({
        where: { id },
        include: USER_WITH_DASHBOARD_INCLUDE,
      });
    } catch (error) {
      console.error("Error in UserRepo.findByIdWithDashboard:", error);
      throw new Error("Failed to fetch user with dashboard");
    }
  }

  static async findByEmail(
    email: string,
    tx?: PrismaTransaction
  ): Promise<User | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.findUnique({ where: { email } });
    } catch (error) {
      console.error("Error in UserRepo.findByEmail:", error);
      throw new Error("Failed to fetch user by email");
    }
  }

  // SIMPLE FILTERED QUERIES (Repository responsibility)
  static async findAll(tx?: PrismaTransaction): Promise<User[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.findMany({
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error in UserRepo.findAll:", error);
      throw new Error("Failed to fetch users");
    }
  }

  static async findByRole(role: Role, tx?: PrismaTransaction): Promise<User[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.findMany({
        where: { role },
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error in UserRepo.findByRole:", error);
      throw new Error("Failed to fetch users by role");
    }
  }

  // Simple attribute getters
  static async getUserRole(
    id: string,
    tx?: PrismaTransaction
  ): Promise<Role | null> {
    try {
      const prismaClient = tx || prisma;
      const user = await prismaClient.user.findUnique({
        where: { id },
        select: { role: true },
      });
      return user?.role || null;
    } catch (error) {
      console.error("Error in UserRepo.getUserRole:", error);
      throw new Error("Failed to get user role");
    }
  }

  static async getDashboardId(
    id: string,
    tx?: PrismaTransaction
  ): Promise<string | null> {
    try {
      const prismaClient = tx || prisma;
      const user = await prismaClient.user.findUnique({
        where: { id },
        select: {
          dashboard: {
            select: { id: true },
          },
        },
      });
      return user?.dashboard?.id || null;
    } catch (error) {
      console.error("Error in UserRepo.getDashboardId:", error);
      throw new Error("Failed to get user dashboard ID");
    }
  }

  // CREATE/UPDATE/DELETE OPERATIONS
  static async create(
    data: Omit<User, "id">,
    tx?: PrismaTransaction
  ): Promise<User> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.create({ data });
    } catch (error) {
      console.error("Error in UserRepo.create:", error);
      throw new Error("Failed to create user");
    }
  }

  static async update(
    id: string,
    data: Partial<User>,
    tx?: PrismaTransaction
  ): Promise<User> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.update({ where: { id }, data });
    } catch (error) {
      console.error("Error in UserRepo.update:", error);
      throw new Error("Failed to update user");
    }
  }

  static async delete(id: string, tx?: PrismaTransaction): Promise<User> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.delete({ where: { id } });
    } catch (error) {
      console.error("Error in UserRepo.delete:", error);
      throw new Error("Failed to delete user");
    }
  }
}
