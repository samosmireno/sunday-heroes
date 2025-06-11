import { RefreshToken, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";

// Define reusable include patterns (DRY principle)
const REFRESH_TOKEN_WITH_USER_INCLUDE = {
  user: {
    select: {
      id: true,
      email: true,
      given_name: true,
      family_name: true,
    },
  },
} satisfies Prisma.RefreshTokenInclude;

// Type definitions using the includes
export type RefreshTokenWithUser = Prisma.RefreshTokenGetPayload<{
  include: typeof REFRESH_TOKEN_WITH_USER_INCLUDE;
}>;

export class RefreshTokenRepo {
  // BASIC CRUD OPERATIONS
  static async findById(
    id: string,
    tx?: PrismaTransaction
  ): Promise<RefreshToken | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.findUnique({ where: { id } });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.findById:", error);
      throw new Error("Failed to fetch refresh token");
    }
  }

  static async findByIdWithUser(
    id: string,
    tx?: PrismaTransaction
  ): Promise<RefreshTokenWithUser | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.findUnique({
        where: { id },
        include: REFRESH_TOKEN_WITH_USER_INCLUDE,
      });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.findByIdWithUser:", error);
      throw new Error("Failed to fetch refresh token with user");
    }
  }

  // SIMPLE FILTERED QUERIES (Repository responsibility)
  static async findAll(tx?: PrismaTransaction): Promise<RefreshToken[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.findMany({
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.findAll:", error);
      throw new Error("Failed to fetch refresh tokens");
    }
  }

  static async findByToken(
    token: string,
    tx?: PrismaTransaction
  ): Promise<RefreshToken | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.findFirst({
        where: { token },
      });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.findByToken:", error);
      throw new Error("Failed to fetch refresh token by token");
    }
  }

  static async findByTokenWithUser(
    token: string,
    tx?: PrismaTransaction
  ): Promise<RefreshTokenWithUser | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.findFirst({
        where: { token },
        include: REFRESH_TOKEN_WITH_USER_INCLUDE,
      });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.findByTokenWithUser:", error);
      throw new Error("Failed to fetch refresh token with user by token");
    }
  }

  static async findByUserId(
    userId: string,
    tx?: PrismaTransaction
  ): Promise<RefreshToken[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.findByUserId:", error);
      throw new Error("Failed to fetch refresh tokens by user");
    }
  }

  static async findActiveByUserId(
    userId: string,
    tx?: PrismaTransaction
  ): Promise<RefreshToken[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.findMany({
        where: {
          user_id: userId,
          expires_at: { gt: new Date() },
        },
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.findActiveByUserId:", error);
      throw new Error("Failed to fetch active refresh tokens by user");
    }
  }

  static async findExpired(tx?: PrismaTransaction): Promise<RefreshToken[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.findMany({
        where: {
          expires_at: { lt: new Date() },
        },
      });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.findExpired:", error);
      throw new Error("Failed to fetch expired refresh tokens");
    }
  }

  // Simple count operations
  static async countByUserId(
    userId: string,
    tx?: PrismaTransaction
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.count({
        where: { user_id: userId },
      });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.countByUserId:", error);
      throw new Error("Failed to count refresh tokens by user");
    }
  }

  static async countActive(tx?: PrismaTransaction): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.count({
        where: {
          expires_at: { gt: new Date() },
        },
      });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.countActive:", error);
      throw new Error("Failed to count active refresh tokens");
    }
  }

  // Simple attribute getters
  static async getUserIdByToken(
    token: string,
    tx?: PrismaTransaction
  ): Promise<string | null> {
    try {
      const prismaClient = tx || prisma;
      const refreshToken = await prismaClient.refreshToken.findFirst({
        where: { token },
        select: { user_id: true },
      });
      return refreshToken?.user_id || null;
    } catch (error) {
      console.error("Error in RefreshTokenRepo.getUserIdByToken:", error);
      throw new Error("Failed to get user ID by token");
    }
  }

  static async isTokenValid(
    token: string,
    tx?: PrismaTransaction
  ): Promise<boolean> {
    try {
      const prismaClient = tx || prisma;
      const refreshToken = await prismaClient.refreshToken.findFirst({
        where: {
          token,
          expires_at: { gt: new Date() },
        },
        select: { id: true },
      });
      return refreshToken !== null;
    } catch (error) {
      console.error("Error in RefreshTokenRepo.isTokenValid:", error);
      throw new Error("Failed to check if token is valid");
    }
  }

  // CREATE/UPDATE/DELETE OPERATIONS
  static async create(
    data: Omit<RefreshToken, "id">,
    tx?: PrismaTransaction
  ): Promise<RefreshToken> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.create({ data });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.create:", error);
      throw new Error("Failed to create refresh token");
    }
  }

  static async update(
    id: string,
    data: Partial<RefreshToken>,
    tx?: PrismaTransaction
  ): Promise<RefreshToken> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.update({ where: { id }, data });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.update:", error);
      throw new Error("Failed to update refresh token");
    }
  }

  static async updateByToken(
    token: string,
    data: Partial<RefreshToken>,
    tx?: PrismaTransaction
  ): Promise<RefreshToken> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.update({ where: { token }, data });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.updateByToken:", error);
      throw new Error("Failed to update refresh token by token");
    }
  }

  static async updateLastUsed(
    token: string,
    tx?: PrismaTransaction
  ): Promise<RefreshToken> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.update({
        where: { token },
        data: { last_used_at: new Date() },
      });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.updateLastUsed:", error);
      throw new Error("Failed to update last used timestamp");
    }
  }

  static async delete(
    id: string,
    tx?: PrismaTransaction
  ): Promise<RefreshToken> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.delete({ where: { id } });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.delete:", error);
      throw new Error("Failed to delete refresh token");
    }
  }

  static async deleteByToken(
    token: string,
    tx?: PrismaTransaction
  ): Promise<RefreshToken | null> {
    try {
      const prismaClient = tx || prisma;

      // First check if token exists
      const refreshToken = await prismaClient.refreshToken.findFirst({
        where: { token },
      });

      if (!refreshToken) {
        return null;
      }

      return await prismaClient.refreshToken.delete({
        where: { id: refreshToken.id },
      });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.deleteByToken:", error);
      throw new Error("Failed to delete refresh token by token");
    }
  }

  static async deleteByUserId(
    userId: string,
    tx?: PrismaTransaction
  ): Promise<{ count: number }> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.deleteMany({
        where: { user_id: userId },
      });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.deleteByUserId:", error);
      throw new Error("Failed to delete refresh tokens by user");
    }
  }

  static async deleteExpired(
    tx?: PrismaTransaction
  ): Promise<{ count: number }> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.deleteMany({
        where: {
          expires_at: { lt: new Date() },
        },
      });
    } catch (error) {
      console.error("Error in RefreshTokenRepo.deleteExpired:", error);
      throw new Error("Failed to delete expired refresh tokens");
    }
  }
}
