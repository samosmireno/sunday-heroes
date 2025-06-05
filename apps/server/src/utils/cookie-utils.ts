import { Response } from "express";

export class CookieUtils {
  private static readonly COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
  };

  static setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
  ) {
    res.cookie("access-token", accessToken, {
      ...this.COOKIE_OPTIONS,
      maxAge: 30 * 60 * 1000,
    });

    res.cookie("refresh-token", refreshToken, {
      ...this.COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  static clearAuthCookies(res: Response) {
    res.clearCookie("refresh-token", this.COOKIE_OPTIONS);
    res.clearCookie("access-token", this.COOKIE_OPTIONS);
  }
}
