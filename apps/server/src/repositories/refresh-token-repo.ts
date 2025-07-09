import { RefreshToken, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";

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

export type RefreshTokenWithUser = Prisma.RefreshTokenGetPayload<{
  include: typeof REFRESH_TOKEN_WITH_USER_INCLUDE;
}>;

export class RefreshTokenRepo {
  static async findById(
    id: string,
    tx?: PrismaTransaction
  ): Promise<RefreshToken | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.findUnique({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.findById");
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
      throw PrismaErrorHandler.handle(
        error,
        "RefreshTokenRepo.findByIdWithUser"
      );
    }
  }

  static async findAll(tx?: PrismaTransaction): Promise<RefreshToken[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.findMany({
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.findAll");
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
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.findByToken");
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
      throw PrismaErrorHandler.handle(
        error,
        "RefreshTokenRepo.findByTokenWithUser"
      );
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
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.findByUserId");
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
      throw PrismaErrorHandler.handle(
        error,
        "RefreshTokenRepo.findActiveByUserId"
      );
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
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.findExpired");
    }
  }

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
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.countByUserId");
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
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.countActive");
    }
  }

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
      throw PrismaErrorHandler.handle(
        error,
        "RefreshTokenRepo.getUserIdByToken"
      );
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
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.isTokenValid");
    }
  }

  static async create(
    data: Omit<RefreshToken, "id">,
    tx?: PrismaTransaction
  ): Promise<RefreshToken> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.create({ data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.create");
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
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.update");
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
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.updateByToken");
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
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.updateLastUsed");
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
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.delete");
    }
  }

  static async deleteByToken(
    token: string,
    tx?: PrismaTransaction
  ): Promise<RefreshToken | null> {
    try {
      const prismaClient = tx || prisma;

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
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.deleteByToken");
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
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.deleteByUserId");
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
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.deleteExpired");
    }
  }
}
