import { RefreshToken } from "@prisma/client";
import { RefreshTokenRepo } from "../repositories/refresh-token-repo";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export class RefreshTokenService {
  private static readonly REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  // Business logic: Validate refresh token with comprehensive checks
  static async validateRefreshToken(token: string): Promise<{
    userId: string;
    decoded: any;
    refreshToken: RefreshToken;
  }> {
    // Input validation
    if (!token || typeof token !== "string") {
      throw new Error("Invalid token format");
    }

    // Check if token exists in database
    const refreshToken = await RefreshTokenRepo.findByToken(token);
    if (!refreshToken) {
      throw new Error("Refresh token not found");
    }

    // Check if token is expired
    if (refreshToken.expires_at < new Date()) {
      await this.deleteToken(token);
      throw new Error("Refresh token expired");
    }

    // Verify JWT signature
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.refreshSecret) as any;
    } catch (error) {
      await this.deleteToken(token);
      throw new Error("Invalid token signature");
    }

    // Check token user mismatch
    if (decoded.userId !== refreshToken.user_id) {
      await this.deleteAllUserTokens(refreshToken.user_id);
      throw new Error("Token user mismatch");
    }

    // Update last used timestamp
    await RefreshTokenRepo.updateLastUsed(token);

    return {
      userId: refreshToken.user_id,
      decoded,
      refreshToken,
    };
  }

  // Business logic: Create new refresh token with cleanup
  static async createRefreshToken(userId: string): Promise<RefreshToken> {
    // Generate new JWT token
    const newRefreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
      expiresIn: "30 days",
    });

    // Clean up expired tokens for this user
    await this.cleanupExpiredTokensForUser(userId);

    // Create new token in database
    return await RefreshTokenRepo.create({
      user_id: userId,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY_MS),
      last_used_at: new Date(),
      created_at: new Date(),
    });
  }

  // Business logic: Get user's active tokens
  static async getUserActiveTokens(userId: string): Promise<RefreshToken[]> {
    return await RefreshTokenRepo.findActiveByUserId(userId);
  }

  // Business logic: Get all user tokens (admin function)
  static async getAllUserTokens(userId: string): Promise<RefreshToken[]> {
    return await RefreshTokenRepo.findByUserId(userId);
  }

  // Business logic: Delete specific token
  static async deleteToken(token: string): Promise<boolean> {
    if (!token || typeof token !== "string") {
      return false;
    }

    const result = await RefreshTokenRepo.deleteByToken(token);
    return result !== null;
  }

  // Business logic: Delete all user tokens (logout from all devices)
  static async deleteAllUserTokens(userId: string): Promise<number> {
    const result = await RefreshTokenRepo.deleteByUserId(userId);
    return result.count;
  }

  // Business logic: Clean up expired tokens for specific user
  static async cleanupExpiredTokensForUser(userId: string): Promise<void> {
    const userTokens = await RefreshTokenRepo.findByUserId(userId);
    const expiredTokens = userTokens.filter(
      (token) => token.expires_at < new Date()
    );

    for (const token of expiredTokens) {
      await RefreshTokenRepo.delete(token.id);
    }
  }

  // Business logic: Global cleanup of expired tokens (scheduled job)
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await RefreshTokenRepo.deleteExpired();
    console.log(`Cleaned up ${result.count} expired refresh tokens`);
    return result.count;
  }

  // Business logic: Get user ID from token (for middleware)
  static async getUserIdFromToken(token: string): Promise<string | null> {
    if (!token || typeof token !== "string") {
      return null;
    }

    try {
      const userId = await RefreshTokenRepo.getUserIdByToken(token);
      if (!userId) {
        return null;
      }

      // Verify token is still valid (not expired)
      const isValid = await RefreshTokenRepo.isTokenValid(token);
      return isValid ? userId : null;
    } catch (error) {
      console.error("Error getting user ID from token:", error);
      return null;
    }
  }

  // Business logic: Rotate refresh token (security best practice)
  static async rotateRefreshToken(oldToken: string): Promise<RefreshToken> {
    const validation = await this.validateRefreshToken(oldToken);

    // Delete old token
    await this.deleteToken(oldToken);

    // Create new token
    return await this.createRefreshToken(validation.userId);
  }
}
