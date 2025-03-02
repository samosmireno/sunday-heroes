import { RefreshToken } from "@prisma/client";
import prisma from "./prisma-client";
import { UserRepo } from "./user-repo";

export class RefreshTokenRepo {
  static async getAllRefreshTokens(): Promise<RefreshToken[]> {
    return prisma.refreshToken.findMany();
  }

  static async getAllRefreshTokensByUserId(
    user_id: string
  ): Promise<RefreshToken[] | null> {
    return prisma.refreshToken.findMany({ where: { user_id } });
  }

  static async getUserIdByRefreshToken(token: string): Promise<string | null> {
    if (!token || typeof token !== "string") {
      return null;
    }

    const refreshToken = await prisma.refreshToken.findFirst({
      where: {
        token: {
          equals: token,
        },
      },
    });

    return refreshToken?.user_id ?? null;
  }

  static async createRefreshToken(
    data: Omit<RefreshToken, "id">
  ): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  }

  static async updateRefreshToken(
    user_id: string,
    data: Partial<RefreshToken>
  ): Promise<RefreshToken> {
    return prisma.refreshToken.update({ where: { id: user_id }, data });
  }

  /*static async upsertRefreshToken(
    userId: number,
    data: Omit<RefreshToken, "id" | "userId">
  ): Promise<RefreshToken> {
    return prisma.refreshToken.upsert({
      where: { id: userId },
      update: data,
      create: { ...data, userId },
    });
  }*/

  static async deleteRefreshToken(token: string): Promise<RefreshToken | null> {
    if (!token || typeof token !== "string") {
      return null;
    }
    const refreshToken = await prisma.refreshToken.findFirst({
      where: { token },
    });

    if (!refreshToken) {
      return null;
    }

    return prisma.refreshToken.delete({
      where: { id: refreshToken.id },
    });
  }

  static async deleteAllRefreshTokensFromUser(user_id: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { user_id } });
  }

  static async deleteExpiredRefreshTokens(): Promise<void> {
    const now = new Date();
    await prisma.refreshToken.deleteMany({
      where: {
        expires_at: {
          lt: now,
        },
      },
    });
  }
}
