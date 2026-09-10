import { EventEmitter } from "node:events";
import { Request, Response } from "express";
import { describe, expect, it } from "vitest";
import { createUser } from "../../test/factories";
import { RefreshTokenRepo } from "../repositories/refresh-token/refresh-token-repo";
import { RefreshTokenService } from "../services/refresh-token-service";
import { handleRefreshToken } from "./auth-handler";

/**
 * Enough of an Express response for the refresh handler: the cookies it writes,
 * the body it sends, and the `finish` event that means the response actually
 * reached the browser. Nothing here emits `finish` on its own — the test does,
 * which is how a test stops exactly where an interrupted request stops.
 */
function fakeResponse() {
  const emitter = new EventEmitter();

  const res = {
    statusCode: 200,
    cookies: {} as Record<string, string>,
    body: undefined as unknown,
    cookie(name: string, value: string) {
      res.cookies[name] = value;
      return res;
    },
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
    on(event: string, listener: () => void) {
      emitter.on(event, listener);
      return res;
    },
    /** The response reaching the browser. */
    deliver() {
      emitter.emit("finish");
    },
  };

  return res;
}

/** Retries until the assertion holds: retiring the old token is fire-and-forget. */
async function eventually(check: () => Promise<boolean>, timeoutMs = 5_000) {
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    if (await check()) return;
    if (Date.now() > deadline) {
      throw new Error("Condition was still false when the wait ran out");
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

async function refreshWith(token: string) {
  const req = { cookies: { "refresh-token": token } } as unknown as Request;
  const res = fakeResponse();
  const errors: unknown[] = [];

  await handleRefreshToken(req, res as unknown as Response, (error) =>
    errors.push(error),
  );

  return { res, errors };
}

describe("Refresh-token rotation survives an interrupted response", () => {
  it("leaves the old token usable when the response never reaches the browser", async () => {
    const user = await createUser();
    const old = await RefreshTokenService.createRefreshToken(user.id);

    // The handler runs to the end, but the response is never delivered: a
    // Render restart, a dropped connection, a client that walked away. This is
    // the window that used to brick a session for good — the old row was
    // deleted on the way in, so the cookie the browser kept was backed by
    // nothing and every later refresh answered "Refresh token not found".
    const { res, errors } = await refreshWith(old.token);

    expect(errors).toEqual([]);
    expect(res.cookies["refresh-token"]).toBeTruthy();
    expect(res.cookies["refresh-token"]).not.toBe(old.token);

    // The browser still holds the old cookie, so the old cookie must still work.
    await expect(
      RefreshTokenService.validateRefreshToken(old.token),
    ).resolves.toMatchObject({ userId: user.id });
  });

  it("retires the old token once the response has been delivered", async () => {
    const user = await createUser();
    const old = await RefreshTokenService.createRefreshToken(user.id);

    const { res } = await refreshWith(old.token);
    const replacement = res.cookies["refresh-token"];

    res.deliver();

    // Rotation is still rotation: one use, and the old token goes.
    await eventually(
      async () => (await RefreshTokenRepo.findByToken(old.token)) === null,
    );
    await expect(
      RefreshTokenService.validateRefreshToken(replacement),
    ).resolves.toMatchObject({ userId: user.id });
  });

  it("keeps the old token when the response goes out as an error", async () => {
    const user = await createUser();
    const old = await RefreshTokenService.createRefreshToken(user.id);

    const { res } = await refreshWith(old.token);
    res.statusCode = 500;
    res.deliver();

    // Nothing was rotated: whatever the browser has, it is not the replacement.
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(await RefreshTokenRepo.findByToken(old.token)).not.toBeNull();
  });
});
