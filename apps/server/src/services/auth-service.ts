import jwt from "jsonwebtoken";
import axios from "axios";
import { UserRepo } from "../repositories/user/user-repo";
import { DashboardRepo } from "../repositories/dashboard/dashboard-repo";
import { config } from "../config/config";
import { Role, User } from "@prisma/client";
import { RegisterRequest, UserResponse } from "@repo/shared-types";
import { RefreshTokenService } from "./refresh-token-service";
import { PasswordUtils } from "../utils/password-utils";

export class AuthService {
  static readonly ACCESS_TOKEN_EXPIRY = "30m";
  static readonly REFRESH_TOKEN_EXPIRY = "30 days";
  static readonly REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;
  static readonly ACCESS_TOKEN_EXPIRY_MS = 30 * 60 * 1000;

  static async validateRefreshToken(refreshToken: string) {
    return await RefreshTokenService.validateRefreshToken(refreshToken);
  }

  static async refreshUserTokens(userId: string, email: string) {
    const accessToken = jwt.sign({ userId, email }, config.jwt.accessSecret, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    await RefreshTokenService.cleanupExpiredTokens();
    const refreshTokenData =
      await RefreshTokenService.createRefreshToken(userId);

    return { accessToken, refreshToken: refreshTokenData.token };
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
    let user = await UserRepo.findByEmail(googleUser.email);

    if (!user) {
      user = await UserRepo.create({
        email: googleUser.email,
        givenName: googleUser.given_name,
        familyName: googleUser.family_name,
        password: null,
        role: Role.ADMIN,
        isRegistered: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      await DashboardRepo.create({
        adminId: user.id,
        name: `${googleUser.given_name}'s Dashboard`,
        createdAt: new Date(),
      });
    }

    return user;
  }

  static async registerUser(data: RegisterRequest): Promise<User> {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingUser = await UserRepo.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const passwordValidation = PasswordUtils.validate(data.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    const hashedPassword = await PasswordUtils.hash(data.password);

    const user = await UserRepo.create({
      email: normalizedEmail,
      givenName: data.name,
      familyName: null,
      password: hashedPassword,
      role: Role.ADMIN,
      isRegistered: true,
      createdAt: new Date(),
      lastLogin: new Date(),
    });

    await DashboardRepo.create({
      adminId: user.id,
      name: `${data.name}'s Dashboard`,
      createdAt: new Date(),
    });

    return user;
  }

  static async loginUser(email: string, password: string): Promise<User> {
    const user = await UserRepo.findByEmail(email.trim().toLowerCase());
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.password) {
      throw new Error("Please login with Google");
    }

    const isPasswordValid = await PasswordUtils.compare(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    await UserRepo.update(user.id, { lastLogin: new Date() });

    return user;
  }

  static createUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.givenName,
      role: user.role as UserResponse["role"],
    };
  }

  static encodeUserInfo(userInfo: UserResponse): string {
    return Buffer.from(JSON.stringify(userInfo), "utf8").toString("base64");
  }

  static async logout(refreshToken?: string) {
    if (refreshToken) {
      const userId = await RefreshTokenService.getUserIdFromToken(refreshToken);
      if (userId) {
        await RefreshTokenService.deleteToken(refreshToken);
      }
    }
  }
}
