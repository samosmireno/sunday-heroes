import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import { UserRepo } from "../repositories/user-repo";
import { RefreshTokenRepo } from "../repositories/refresh-token-repo";
import { config } from "../config/config";

export const handleVerifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["access-token"];

    if (!token) {
      console.log("No access token found");
      res.status(401).json({
        loggedIn: false,
        message: "No access token provided",
      });
      return;
    }

    return jwt.verify(token, config.jwt.accessSecret, (err: any) => {
      if (err) {
        console.log("Token verification failed:", err.message);
        res.status(401).json({
          loggedIn: false,
          message: "Access token expired",
        });
        return;
      }

      res.status(200).json({
        loggedIn: true,
      });
      return;
    });
  } catch (error) {
    console.error("Verify error:", error);
    next(error);
  }
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

      const accessToken = jwt.sign(
        {
          userId: decoded.id,
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

      //create umesto upsert
      /*await RefreshTokenRepo.upsertRefreshToken(foundUserId, {
        createdAt: new Date(),
        token: newRefreshToken,
      });*/

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
        path: "/",
        partitioned: true,
      });

      res.cookie("refresh-token", newRefreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "none",
        path: "/",
        partitioned: true,
      });

      return res.status(200).json({
        loggedIn: true,
      });
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
      path: "/",
      partitioned: true,
    });

    res.clearCookie("access-token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      partitioned: true,
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
    const userInfo = JSON.parse(
      Buffer.from(id_token.split(".")[1], "base64").toString()
    );

    //const username = parseUsernameFromMail(userInfo.email);
    const user = await UserRepo.getUserByEmail(userInfo.email);

    if (!user) {
      return res.status(500).send("User not found");
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: userInfo.email,
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
      path: "/",
      partitioned: true,
    });

    res.cookie("refresh-token", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      path: "/",
      partitioned: true,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    //res.redirect(config.client);
    return res.status(200).json({ success: true });
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
