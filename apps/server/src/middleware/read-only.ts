import { Request, Response, NextFunction } from "express";
import {
  READ_ONLY_CODE,
  READ_ONLY_MESSAGE,
  ReadOnlyErrorResponse,
} from "@repo/shared-types";
import { config } from "../config/config";

/**
 * The Cut-over freeze. With `READ_ONLY=true` this app is the old copy at
 * old.sunday-heroes.app: the new app has imported its database, and nothing
 * may change here afterwards. With the flag off this middleware calls `next()`
 * and does nothing else.
 *
 * Deny by default. Reads pass; every other method is refused unless it is on
 * the allowlist below. A route added later is refused without anyone having to
 * remember this file.
 *
 * GET routes are not checked one by one, so none of them may write. As of the
 * freeze, the only GETs that write are auth ones: `/auth/refresh` rotates a
 * refresh token, `/auth/logout` deletes one, and `/auth/google/callback` may
 * create a User. The handler refuses that last case under the flag.
 */

/** Methods that never write here. HEAD runs the GET handler; OPTIONS is answered by `cors`. */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

interface AllowedWrite {
  method: string;
  path: string;
  /** Strips whatever part of the request would write beyond signing in. */
  neutralise?: (req: Request) => void;
}

/**
 * The only writes a frozen app accepts: those that let people sign in to read.
 * They write refresh tokens and `lastLogin`, which the migration doesn't carry.
 * Register, forgot-password and reset-password are left off on purpose. A User
 * or password created after the final dump would never reach the new app.
 */
const READ_ONLY_ALLOWED_WRITES: readonly AllowedWrite[] = [
  {
    method: "POST",
    path: "/auth/login",
    // Signing in with an invite token also accepts the invitation.
    neutralise: (req) => {
      if (req.body) delete req.body.inviteToken;
    },
  },
  { method: "POST", path: "/auth/refresh" },
];

/**
 * Reads that would otherwise write more than a sign-in. The Google callback
 * carries an invite token in `state`, and accepting it links a player. Keyed by
 * path alone because HEAD runs the same handler as GET.
 */
const NEUTRALISED_READS: ReadonlyMap<string, (req: Request) => void> = new Map([
  [
    "/auth/google/callback",
    (req: Request) => {
      delete req.query.state;
    },
  ],
]);

/**
 * Express routes case-insensitively and ignores a trailing slash, so
 * `/AUTH/Login/` reaches the login handler. Lookups here match the same way.
 * That way a variant spelling can't skip a neutraliser.
 */
const normalise = (path: string) => path.toLowerCase().replace(/\/+$/, "");

export const readOnlyGuard = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!config.readOnly) return next();

  const path = normalise(req.path);

  if (SAFE_METHODS.has(req.method)) {
    NEUTRALISED_READS.get(path)?.(req);
    return next();
  }

  const allowed = READ_ONLY_ALLOWED_WRITES.find(
    (entry) => entry.method === req.method && entry.path === path,
  );
  if (allowed) {
    allowed.neutralise?.(req);
    return next();
  }

  const body: ReadOnlyErrorResponse = {
    code: READ_ONLY_CODE,
    message: READ_ONLY_MESSAGE,
    error: READ_ONLY_MESSAGE,
  };
  res.status(503).json(body);
};
