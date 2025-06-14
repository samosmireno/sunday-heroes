import { RefreshToken } from "@prisma/client";
import { RefreshTokenRepo } from "../repositories/refresh-token-repo";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { AuthService } from "./auth-service";

export class RefreshTokenService {
  static async validateRefreshToken(token: string): Promise<{
    userId: string;
    decoded: any;
    refreshToken: RefreshToken;
  }> {
    if (!token || typeof token !== "string") {
      throw new Error("Invalid token format");
    }

    const refreshToken = await RefreshTokenRepo.findByToken(token);
    if (!refreshToken) {
      throw new Error("Refresh token not found");
    }

    if (refreshToken.expires_at < new Date()) {
      await this.deleteToken(token);
      throw new Error("Refresh token expired");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.refreshSecret) as any;
    } catch (error) {
      await this.deleteToken(token);
      throw new Error("Invalid token signature");
    }

    if (decoded.userId !== refreshToken.user_id) {
      await this.deleteAllUserTokens(refreshToken.user_id);
      throw new Error("Token user mismatch");
    }

    await RefreshTokenRepo.updateLastUsed(token);

    return {
      userId: refreshToken.user_id,
      decoded,
      refreshToken,
    };
  }

  static async createRefreshToken(userId: string): Promise<RefreshToken> {
    const newRefreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
      expiresIn: AuthService.REFRESH_TOKEN_EXPIRY,
    });

    await this.cleanupExpiredTokensForUser(userId);

    return await RefreshTokenRepo.create({
      user_id: userId,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + AuthService.REFRESH_TOKEN_EXPIRY_MS),
      last_used_at: new Date(),
      created_at: new Date(),
    });
  }

  static async getUserActiveTokens(userId: string): Promise<RefreshToken[]> {
    return await RefreshTokenRepo.findActiveByUserId(userId);
  }

  static async getAllUserTokens(userId: string): Promise<RefreshToken[]> {
    return await RefreshTokenRepo.findByUserId(userId);
  }

  static async deleteToken(token: string): Promise<boolean> {
    if (!token || typeof token !== "string") {
      return false;
    }

    const result = await RefreshTokenRepo.deleteByToken(token);
    return result !== null;
  }

  static async deleteAllUserTokens(userId: string): Promise<number> {
    const result = await RefreshTokenRepo.deleteByUserId(userId);
    return result.count;
  }

  static async cleanupExpiredTokensForUser(userId: string): Promise<void> {
    const userTokens = await RefreshTokenRepo.findByUserId(userId);
    const expiredTokens = userTokens.filter(
      (token) => token.expires_at < new Date()
    );

    for (const token of expiredTokens) {
      await RefreshTokenRepo.delete(token.id);
    }
  }

  static async cleanupExpiredTokens(): Promise<number> {
    const result = await RefreshTokenRepo.deleteExpired();
    console.log(`Cleaned up ${result.count} expired refresh tokens`);
    return result.count;
  }

  static async getUserIdFromToken(token: string): Promise<string | null> {
    if (!token || typeof token !== "string") {
      return null;
    }

    try {
      const userId = await RefreshTokenRepo.getUserIdByToken(token);
      if (!userId) {
        return null;
      }

      const isValid = await RefreshTokenRepo.isTokenValid(token);
      return isValid ? userId : null;
    } catch (error) {
      console.error("Error getting user ID from token:", error);
      return null;
    }
  }

  static async rotateRefreshToken(oldToken: string): Promise<RefreshToken> {
    const validation = await this.validateRefreshToken(oldToken);

    await this.deleteToken(oldToken);

    return await this.createRefreshToken(validation.userId);
  }
}
