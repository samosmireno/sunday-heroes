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

export const handleRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name, inviteToken } = req.body as RegisterRequest;

    if (!email || !password || !name) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await AuthService.registerUser({
      email,
      password,
      name,
    });

    const { accessToken, refreshToken } = await AuthService.refreshUserTokens(
      user.id,
      user.email
    );

    CookieUtils.setAuthCookies(res, accessToken, refreshToken);

    if (inviteToken) {
      await InvitationService.handleInvitationForAuth(inviteToken, user.id);
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.givenName,
      role: user.role as UserResponse["role"],
    };

    return res.status(201).json(userResponse);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    next(error);
  }
};

export const handleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, inviteToken } = req.body as LoginRequest;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await AuthService.loginUser(email, password);

    const { accessToken, refreshToken } = await AuthService.refreshUserTokens(
      user.id,
      user.email
    );

    CookieUtils.setAuthCookies(res, accessToken, refreshToken);

    if (inviteToken) {
      await InvitationService.handleInvitationForAuth(inviteToken, user.id);
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.givenName,
      role: user.role as UserResponse["role"],
    };

    return res.status(200).json(userResponse);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(401).json({
        message: error.message,
      });
    }
    next(error);
  }
};

export const handleRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies["refresh-token"];

    if (!refreshToken) {
      return res.status(401).json({
        loggedIn: false,
        message: "Empty refresh token",
      });
    }

    CookieUtils.clearAuthCookies(res);

    const { userId, decoded } =
      await AuthService.validateRefreshToken(refreshToken);
    await RefreshTokenService.deleteToken(refreshToken);

    if (!userId) {
      return res.status(401).json({
        loggedIn: false,
        message: "Invalid user ID",
      });
    }

    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        loggedIn: false,
        message: "User not found",
      });
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

    return res.status(200).json(authResponse);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(403).json({
        loggedIn: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const handleLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies["refresh-token"];
    CookieUtils.clearAuthCookies(res);

    await AuthService.logout(refreshToken);

    return res.status(200).json({
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
  next: NextFunction
) => {
  try {
    const code = req.query.code as string;
    const inviteToken = req.query.state as string;

    const googleUser = await AuthService.exchangeGoogleCode(code);
    const user = await AuthService.findOrCreateUser(googleUser);

    const { accessToken, refreshToken } = await AuthService.refreshUserTokens(
      user.id,
      googleUser.email
    );

    CookieUtils.setAuthCookies(res, accessToken, refreshToken);

    if (inviteToken) {
      return await InvitationService.handleInvitationForGoogle(
        inviteToken,
        user,
        res
      );
    }

    const userInfo = AuthService.createUserResponse(user);
    const encodedUser = encodeURIComponent(
      AuthService.encodeUserInfo(userInfo)
    );
    res.redirect(`${config.google.redirectClientUrl}?user=${encodedUser}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Google callback error:", error.message);
    }
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const user = await UserService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.givenName,
      role: user.role as UserResponse["role"],
    };
    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error fetching user:", error);
    next(error);
  }
};

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const resetToken =
      await PasswordResetService.createPasswordResetToken(email);
    await EmailService.sendPasswordResetEmail(email, resetToken);

    return res.status(200).json({
      message:
        "If an account exists with this email, you will receive password reset instructions",
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(200).json({
        message:
          "If an account exists with this email, you will receive password reset instructions",
      });
    }
    next(error);
  }
};

export const handleResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    await PasswordResetService.resetPassword(token, password);

    return res.status(200).json({
      message: "Password has been reset successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    next(error);
  }
};
