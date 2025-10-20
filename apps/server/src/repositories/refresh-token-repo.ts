import { RefreshToken, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";

const REFRESH_TOKEN_WITH_USER_INCLUDE = {
  user: {
    select: {
      id: true,
      email: true,
      givenName: true,
      familyName: true,
    },
  },
} satisfies Prisma.RefreshTokenInclude;

export type RefreshTokenWithUser = Prisma.RefreshTokenGetPayload<{
  include: typeof REFRESH_TOKEN_WITH_USER_INCLUDE;
}>;

export class RefreshTokenRepo {
  static async findById(
    id: string,
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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

  static async findAll(tx?: Prisma.TransactionClient): Promise<RefreshToken[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.findAll");
    }
  }

  static async findByToken(
    token: string,
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
  ): Promise<RefreshToken[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.findByUserId");
    }
  }

  static async findActiveByUserId(
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<RefreshToken[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.findMany({
        where: {
          userId,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "RefreshTokenRepo.findActiveByUserId"
      );
    }
  }

  static async findExpired(
    tx?: Prisma.TransactionClient
  ): Promise<RefreshToken[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.findMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.findExpired");
    }
  }

  static async countByUserId(
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.count({
        where: { userId },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.countByUserId");
    }
  }

  static async countActive(tx?: Prisma.TransactionClient): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.count({
        where: {
          expiresAt: { gt: new Date() },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.countActive");
    }
  }

  static async getUserIdByToken(
    token: string,
    tx?: Prisma.TransactionClient
  ): Promise<string | null> {
    try {
      const prismaClient = tx || prisma;
      const refreshToken = await prismaClient.refreshToken.findFirst({
        where: { token },
        select: { userId: true },
      });
      return refreshToken?.userId || null;
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "RefreshTokenRepo.getUserIdByToken"
      );
    }
  }

  static async isTokenValid(
    token: string,
    tx?: Prisma.TransactionClient
  ): Promise<boolean> {
    try {
      const prismaClient = tx || prisma;
      const refreshToken = await prismaClient.refreshToken.findFirst({
        where: {
          token,
          expiresAt: { gt: new Date() },
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
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
  ): Promise<RefreshToken> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.update({
        where: { token },
        data: { lastUsedAt: new Date() },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.updateLastUsed");
    }
  }

  static async delete(
    id: string,
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
  ): Promise<{ count: number }> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.deleteMany({
        where: { userId },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.deleteByUserId");
    }
  }

  static async deleteExpired(
    tx?: Prisma.TransactionClient
  ): Promise<{ count: number }> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.refreshToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "RefreshTokenRepo.deleteExpired");
    }
  }
}
