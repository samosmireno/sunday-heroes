import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth-service";
import { CookieUtils } from "../utils/cookie-utils";
import { InvitationService } from "../services/invitation-service";
import { config } from "../config/config";
import { AuthenticatedRequest } from "../types";
import { UserService } from "../services/user-service";
import { RefreshTokenService } from "../services/refresh-token-service";
import {
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from "@repo/shared-types";
import { PasswordResetService } from "../services/password-reset-service";
import { EmailService } from "../services/email-service";
import {
  AuthenticationError,
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";
import { sendSuccess } from "../utils/response-utils";
import logger from "../logger";

export const handleRegister = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, name, inviteToken } = req.body as RegisterRequest;

    if (!email || !password || !name) {
      throw new BadRequestError("Email and password are required");
    }

    logger.info({ email }, "User registration attempt");

    const user = await AuthService.registerUser({
      email,
      password,
      name,
    });

    const { accessToken, refreshToken } = await AuthService.refreshUserTokens(
      user.id,
      user.email,
    );

    CookieUtils.setAuthCookies(res, accessToken, refreshToken);

    if (inviteToken) {
      await InvitationService.handleInvitationForAuth(inviteToken, user.id);
      logger.info(
        { userId: user.id },
        "Invitation applied during registration",
      );
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.givenName,
      role: user.role as UserResponse["role"],
    };

    logger.info({ userId: user.id }, "User registered successfully");

    sendSuccess(res, userResponse, 201);
  } catch (error) {
    next(error);
  }
};

export const handleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, inviteToken } = req.body as LoginRequest;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    logger.info({ email }, "Login attempt");

    const user = await AuthService.loginUser(email, password);

    const { accessToken, refreshToken } = await AuthService.refreshUserTokens(
      user.id,
      user.email,
    );

    CookieUtils.setAuthCookies(res, accessToken, refreshToken);

    if (inviteToken) {
      await InvitationService.handleInvitationForAuth(inviteToken, user.id);
      logger.info(
        { userId: user.id },
        "Invitation applied during registration",
      );
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.givenName,
      role: user.role as UserResponse["role"],
    };

    logger.info({ userId: user.id }, "User logged in");

    sendSuccess(res, userResponse);
  } catch (error) {
    next(error);
  }
};

export const handleRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies["refresh-token"];

    if (!refreshToken) {
      throw new AuthenticationError("Empty refresh token");
    }

    CookieUtils.clearAuthCookies(res);

    const { userId, decoded } =
      await AuthService.validateRefreshToken(refreshToken);
    await RefreshTokenService.deleteToken(refreshToken);

    if (!userId) {
      throw new AuthenticationError("Invalid user ID");
    }

    const user = await UserService.getUserById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await AuthService.refreshUserTokens(userId, decoded.email);

    CookieUtils.setAuthCookies(res, accessToken, newRefreshToken);

    const authResponse = {
      id: user.id,
      email: user.email,
      name: user.givenName,
      role: user.role as UserResponse["role"],
    };

    logger.info({ userId: user.id }, "Access token refreshed");

    sendSuccess(res, authResponse);
  } catch (error) {
    next(error);
  }
};

export const handleLogout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies["refresh-token"];
    CookieUtils.clearAuthCookies(res);

    const userId = await AuthService.logout(refreshToken);

    logger.info({ userId }, "User logged out");

    sendSuccess(res, {
      loggedIn: false,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const handleGoogleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const code = req.query.code as string;
    const inviteToken = req.query.state as string;

    logger.info("Google OAuth callback received");

    const googleUser = await AuthService.exchangeGoogleCode(code);
    const user = await AuthService.findOrCreateUser(googleUser);

    const { accessToken, refreshToken } = await AuthService.refreshUserTokens(
      user.id,
      googleUser.email,
    );

    CookieUtils.setAuthCookies(res, accessToken, refreshToken);

    if (inviteToken) {
      return await InvitationService.handleInvitationForGoogle(
        inviteToken,
        user,
        res,
      );
    }

    const userInfo = AuthService.createUserResponse(user);
    const encodedUser = encodeURIComponent(
      AuthService.encodeUserInfo(userInfo),
    );

    logger.info({ userId: user.id }, "Google OAuth login successful");

    res.redirect(`${config.google.redirectClientUrl}?user=${encodedUser}`);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const user = await UserService.getUserById(userId);

    if (!user) {
      throw new NotFoundError("User");
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.givenName,
      role: user.role as UserResponse["role"],
    };

    sendSuccess(res, userResponse);
  } catch (error) {
    next(error);
  }
};

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError("Email is required");
    }

    logger.info({ email }, "Password reset requested");

    const resetToken =
      await PasswordResetService.createPasswordResetToken(email);
    await EmailService.sendPasswordResetEmail(email, resetToken);

    sendSuccess(res, {
      message:
        "If an account exists with this email, you will receive password reset instructions",
    });
  } catch (error) {
    next(error);
  }
};

export const handleResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new BadRequestError("Token and password are required");
    }

    if (password.length < 8) {
      throw new ValidationError([
        {
          field: "password",
          message: "Password must be at least 8 characters long",
          code: "PASSWORD_TOO_SHORT",
        },
      ]);
    }

    await PasswordResetService.resetPassword(token, password);

    logger.info("Password reset completed");

    sendSuccess(res, {
      message: "Password has been reset successfully",
    });
  } catch (error) {
    next(error);
  }
};
