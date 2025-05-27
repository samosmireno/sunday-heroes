import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import { UserRepo } from "../repositories/user-repo";
import { RefreshTokenRepo } from "../repositories/refresh-token-repo";
import { config } from "../config/config";
import { AuthResponse } from "../types";
import { UserResponse } from "@repo/logger";
import { AuthenticatedRequest } from "../middleware/auth-middleware";
import { Role } from "@prisma/client";
import { DashboardRepo } from "../repositories/dashboard-repo";

const createUserAuthResponse = async (
  userId: string
): Promise<AuthResponse> => {
  const user = await UserRepo.getUserById(userId);
  if (!user) {
    return { message: "User not found" };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.given_name,
      role: user.role as UserResponse["role"],
    },
  };
};

export const handleRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const refreshToken = req.cookies["refresh-token"];

    if (!refreshToken) {
      return res.status(401).json({
        loggedIn: false,
        message: "Empty refresh token",
      });
    }

    res.clearCookie("refresh-token", { httpOnly: true, secure: true });

    const foundUserId =
      await RefreshTokenRepo.getUserIdByRefreshToken(refreshToken);

    if (!foundUserId) {
      try {
        const decoded: any = jwt.verify(refreshToken, config.jwt.refreshSecret);
        await RefreshTokenRepo.deleteAllRefreshTokensFromUser(decoded.userId);
      } catch (err) {
        return res.status(403).json({
          loggedIn: false,
          message: "Attempted refresh token reuse",
        });
      }

      return res.status(403).json({
        loggedIn: false,
        message: "No user id with the attempted refresh token",
      });
    }

    await RefreshTokenRepo.deleteRefreshToken(refreshToken);

    try {
      const decoded: any = jwt.verify(refreshToken, config.jwt.refreshSecret);

      if (decoded.userId !== foundUserId) {
        return res.status(403).json({
          loggedIn: false,
          message: "No user with the attempted refresh token",
        });
      }

      const user = await UserRepo.getUserById(foundUserId);
      if (!user) {
        return res.status(404).json({
          loggedIn: false,
          message: "User not found",
        });
      }

      const accessToken = jwt.sign(
        {
          userId: decoded.userId,
          email: decoded.email,
        },
        config.jwt.accessSecret,
        { expiresIn: "30m" }
      );

      const newRefreshToken = jwt.sign(
        { userId: foundUserId },
        config.jwt.refreshSecret,
        {
          expiresIn: "30 days",
        }
      );

      await RefreshTokenRepo.deleteExpiredRefreshTokens();

      await RefreshTokenRepo.createRefreshToken({
        user_id: foundUserId,
        token: newRefreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        last_used_at: new Date(Date.now()),
        created_at: new Date(Date.now()),
      });

      res.cookie("access-token", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 30 * 60 * 1000,
        sameSite: "none",
      });

      res.cookie("refresh-token", newRefreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "none",
      });

      const authResponse = await createUserAuthResponse(user.id);
      return res.status(200).json(authResponse);
    } catch (err) {
      return res.status(403).json({
        loggedIn: false,
        message: "Invalid refresh token",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const handleLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const refreshToken = req.cookies["refresh-token"];

    res.clearCookie("refresh-token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.clearCookie("access-token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    if (!refreshToken) {
      return res.status(200).json({
        loggedIn: false,
        message: "Logged out successfully",
      });
    }

    const userId = await RefreshTokenRepo.getUserIdByRefreshToken(refreshToken);

    if (userId) {
      await RefreshTokenRepo.deleteRefreshToken(refreshToken);
    }

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
): Promise<any> => {
  try {
    const code = req.query.code as string;

    const response = await axios.post(config.google.accessTokenUrl, {
      code,
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      redirect_uri: config.google.redirectUri,
      grant_type: "authorization_code",
    });

    const { id_token } = response.data;
    const googleUser = JSON.parse(
      Buffer.from(id_token.split(".")[1], "base64").toString()
    );

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

      const dashboard = await DashboardRepo.createDashboard({
        admin_id: user.id,
        name: `${googleUser.given_name}'s Dashboard`,
        created_at: new Date(),
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: googleUser.email,
      },
      config.jwt.accessSecret,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwt.refreshSecret,
      {
        expiresIn: "30 days",
      }
    );

    await RefreshTokenRepo.deleteExpiredRefreshTokens();

    await RefreshTokenRepo.createRefreshToken({
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      last_used_at: new Date(Date.now()),
      created_at: new Date(Date.now()),
    });

    res.cookie("access-token", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 30 * 60 * 1000,
      sameSite: "none",
    });

    res.cookie("refresh-token", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "none",
    });

    const userInfo: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.given_name,
      role: user.role as UserResponse["role"],
    };

    res.redirect(
      `${config.google.redirectClientUrl}?user=${Buffer.from(JSON.stringify(userInfo)).toString("base64")}`
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        "Google callback error:",
        (error as any).response?.data || error.message
      );
    }
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authenticatedReq = req as AuthenticatedRequest;
  try {
    const userId = authenticatedReq.userId;

    const userFromService = await UserRepo.getUserById(userId);

    if (!userFromService) {
      return res.status(404).json({ message: "User not found" });
    }

    const user: UserResponse = {
      id: userFromService.id,
      email: userFromService.email,
      name: userFromService.given_name,
      role: userFromService.role as UserResponse["role"],
    };

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    next(error);
  }
};
