import { Response } from "express";

export class CookieUtils {
  /**
   * `sameSite: "lax"`, not `"none"`.
   *
   * The app is same-site everywhere it runs. In production one Express service
   * serves the client bundle, `/api/*` and `/auth/*` off a single origin (see
   * `index.ts`, which mounts `express.static` on the same app, and the
   * Dockerfile that copies the client build into the server image); `config.ts`
   * feeds both `config.client` and the OAuth `baseUrl` from the one
   * `PRODUCTION_URL`. In development the client is `localhost:5173` and the
   * server `localhost:3001`, and a port is not part of a cookie's *site*, so
   * those are same-site too.
   *
   * `"none"` marked these cookies cross-site-capable, which puts them in the
   * class browsers evict hardest — Safari ITP's seven-day cap on script-written
   * cross-site state, Chrome's third-party cookie restrictions, and the
   * short-lived cookie jars of the in-app webviews players open the voting
   * email in. The 30-day refresh cookie was being dropped after a week or
   * less, and a player whose refresh cookie is gone has an unrecoverable
   * session: the vote they then cast is refused at `authenticateToken` and
   * never reaches a handler.
   *
   * Lax still permits the one cross-site entry point we have: the Google OAuth
   * callback is a top-level GET navigation, which Lax sends cookies on.
   */
  private static readonly COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
  };

  static setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
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
