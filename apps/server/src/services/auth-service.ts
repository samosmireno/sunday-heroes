import jwt from "jsonwebtoken";
import axios from "axios";
import { UserRepo } from "../repositories/user-repo";
import { RefreshTokenRepo } from "../repositories/refresh-token-repo";
import { DashboardRepo } from "../repositories/dashboard-repo";
import { config } from "../config/config";
import { Role, User } from "@prisma/client";
import { UserResponse } from "@repo/logger";

export class AuthService {
  static readonly ACCESS_TOKEN_EXPIRY = "30m";
  static readonly REFRESH_TOKEN_EXPIRY = "30 days";
  static readonly REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;
  static readonly ACCESS_TOKEN_EXPIRY_MS = 30 * 60 * 1000;

  static async validateRefreshToken(refreshToken: string) {
    const foundUserId =
      await RefreshTokenRepo.getUserIdByRefreshToken(refreshToken);

    if (!foundUserId) {
      await this.handleInvalidRefreshToken(refreshToken);
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;

    if (decoded.userId !== foundUserId) {
      throw new Error("Token user mismatch");
    }

    return { userId: foundUserId, decoded };
  }

  static async refreshUserTokens(userId: string, email: string) {
    const accessToken = jwt.sign({ userId, email }, config.jwt.accessSecret, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const newRefreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    await RefreshTokenRepo.deleteExpiredRefreshTokens();
    await RefreshTokenRepo.createRefreshToken({
      user_id: userId,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY_MS),
      last_used_at: new Date(),
      created_at: new Date(),
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  static async exchangeGoogleCode(code: string) {
    const response = await axios.post(config.google.accessTokenUrl, {
      code,
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      redirect_uri: config.google.redirectUri,
      grant_type: "authorization_code",
    });

    const { id_token } = response.data;
    return JSON.parse(Buffer.from(id_token.split(".")[1], "base64").toString());
  }

  static async findOrCreateUser(googleUser: any): Promise<User> {
    let user = await UserRepo.getUserByEmail(googleUser.email);

    if (!user) {
      user = await UserRepo.createUser({
        email: googleUser.email,
        given_name: googleUser.given_name,
        family_name: googleUser.family_name,
        role: Role.ADMIN,
        is_registered: true,
        created_at: new Date(),
        last_login: new Date(),
      });

      await DashboardRepo.createDashboard({
        admin_id: user.id,
        name: `${googleUser.given_name}'s Dashboard`,
        created_at: new Date(),
      });
    }

    return user;
  }

  static createUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.given_name,
      role: user.role as UserResponse["role"],
    };
  }

  static encodeUserInfo(userInfo: UserResponse): string {
    return Buffer.from(JSON.stringify(userInfo)).toString("base64");
  }

  static async logout(refreshToken?: string) {
    if (refreshToken) {
      const userId =
        await RefreshTokenRepo.getUserIdByRefreshToken(refreshToken);
      if (userId) {
        await RefreshTokenRepo.deleteRefreshToken(refreshToken);
      }
    }
  }

  private static async handleInvalidRefreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
      await RefreshTokenRepo.deleteAllRefreshTokensFromUser(decoded.userId);
    } catch (err) {
      throw new Error("Invalid refresh token");
    }
  }
}
