import { once } from "node:events";
import { Server } from "node:http";
import { AddressInfo } from "node:net";
import { randomUUID } from "node:crypto";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { READ_ONLY_CODE, READ_ONLY_MESSAGE } from "@repo/shared-types";
import app from "../app";
import { config } from "../config/config";
import prisma from "../repositories/prisma-client";
import { AuthService } from "../services/auth-service";
import { InvitationService } from "../services/invitation-service";
import { RefreshTokenService } from "../services/refresh-token-service";
import { PasswordUtils } from "../utils/password-utils";
import { createUser, createUserWithDashboard } from "../../test/factories";

/** The writes the frozen app still accepts, so people can sign in to read. */
const ALLOWED_WRITES = ["POST /auth/login", "POST /auth/refresh"];

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

interface RouteLayer {
  name: string;
  regexp: RegExp;
  route?: { path: string; methods: Record<string, boolean> };
  handle: { stack?: RouteLayer[] };
}

/**
 * Express 4 keeps a router's mount path only as the regexp path-to-regexp
 * built from it, `/^\/api\/?(?=\/|$)/i` for `/api`. Every mount in this app is
 * a literal path, and a mount this can't read fails the test rather than
 * being skipped.
 */
function mountPath(layer: RouteLayer): string {
  const path = layer.regexp.source
    .replace(/^\^/, "")
    .replace("\\/?(?=\\/|$)", "")
    .replace(/\\\//g, "/");
  if (!/^[\w/-]*$/.test(path)) {
    throw new Error(`Cannot read the mount path of ${layer.regexp}`);
  }
  return path;
}

/** Every route the app answers, as `METHOD /full/path`, read from the routers. */
function listRoutes(stack: RouteLayer[], prefix = ""): string[] {
  return stack.flatMap((layer) => {
    if (layer.route) {
      const { path, methods } = layer.route;
      return (
        Object.keys(methods)
          .filter((method) => method !== "_all")
          // A router's own `/` route is its mount path: `POST /api/matches`.
          .map((method) => `${method.toUpperCase()} ${prefix}${path}`)
          .map((route) => route.replace(/(.)\/$/, "$1"))
      );
    }
    if (layer.name === "router" && layer.handle.stack) {
      return listRoutes(layer.handle.stack, prefix + mountPath(layer));
    }
    return [];
  });
}

const routerStack = (app as unknown as { _router: { stack: RouteLayer[] } })
  ._router.stack;

const mutatingRoutes = listRoutes(routerStack).filter((route) =>
  MUTATING.has(route.split(" ")[0]),
);

/** A concrete URL for a route pattern: every `:param` becomes a made-up id. */
const concrete = (path: string) => path.replace(/:\w+/g, randomUUID());

let server: Server;
let base: string;

beforeAll(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

function request(
  route: string,
  options: { body?: unknown; cookie?: string } = {},
) {
  const [method, path] = route.split(" ");
  return fetch(`${base}${path}`, {
    method,
    redirect: "manual",
    headers: {
      "Content-Type": "application/json",
      ...(options.cookie && { Cookie: options.cookie }),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

async function createPasswordUser(password: string) {
  const user = await createUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { password: await PasswordUtils.hash(password) },
  });
  return user;
}

const refreshCookie = async (userId: string) => {
  const { token } = await RefreshTokenService.createRefreshToken(userId);
  return `refresh-token=${token}`;
};

function signInWithGoogle(email: string, state?: string) {
  vi.spyOn(AuthService, "exchangeGoogleCode").mockResolvedValue({
    email,
    given_name: "Google",
    family_name: "Player",
  });
  const query = new URLSearchParams({ code: "google-code" });
  if (state) query.set("state", state);
  return request(`GET /auth/google/callback?${query}`);
}

afterEach(() => {
  config.readOnly = false;
  vi.restoreAllMocks();
});

it("finds every router's mutating routes", () => {
  // Guards the walker itself: an enumeration that found nothing would pass
  // every assertion below.
  expect(mutatingRoutes.length).toBeGreaterThan(20);
  expect(mutatingRoutes).toEqual(
    expect.arrayContaining([
      "POST /api/matches",
      "PATCH /api/matches/:id",
      "POST /api/votes",
      "POST /api/invitations",
      "DELETE /api/competitions/:id",
      "PATCH /api/leagues/:id/team-names",
      "POST /auth/register",
      "POST /auth/login",
      "DELETE /auth/refresh",
    ]),
  );
});

describe("with READ_ONLY on", () => {
  beforeEach(() => {
    config.readOnly = true;
  });

  it.each(mutatingRoutes.filter((route) => !ALLOWED_WRITES.includes(route)))(
    "refuses %s with a 503 READ_ONLY",
    async (route) => {
      const [method, path] = route.split(" ");
      const response = await request(`${method} ${concrete(path)}`, {
        body: {},
      });

      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({
        code: READ_ONLY_CODE,
        message: READ_ONLY_MESSAGE,
        error: READ_ONLY_MESSAGE,
      });
    },
  );

  it("refuses a signed-in admin's write too", async () => {
    const { user } = await createUserWithDashboard();
    const { accessToken } = await AuthService.refreshUserTokens(
      user.id,
      user.email,
    );

    const response = await request("POST /api/competitions", {
      cookie: `access-token=${accessToken}`,
      body: { name: "Frozen", type: "DUEL" },
    });

    expect(response.status).toBe(503);
    expect(await prisma.competition.count()).toBe(0);
  });

  it("refuses a mutating method on any spelling of a path", async () => {
    for (const route of [
      "POST /API/matches",
      "POST /auth/Register/",
      "PUT /auth/login",
      "POST /nowhere",
    ]) {
      expect((await request(route, { body: {} })).status).toBe(503);
    }
  });

  it("lets every GET through", async () => {
    const response = await request("GET /api/status");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ readOnly: true });
  });

  it("signs in with a password, without accepting an invitation", async () => {
    const user = await createPasswordUser("correct-horse");
    const accept = vi.spyOn(InvitationService, "handleInvitationForAuth");

    const response = await request("POST /auth/login", {
      body: {
        email: user.email,
        password: "correct-horse",
        inviteToken: "an-invitation",
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.getSetCookie().join(";")).toContain(
      "refresh-token=",
    );
    expect(accept).not.toHaveBeenCalled();
  });

  it.each(["GET", "POST"])("refreshes a session with %s", async (method) => {
    const user = await createUser();

    const response = await request(`${method} /auth/refresh`, {
      cookie: await refreshCookie(user.id),
    });

    expect(response.status).toBe(200);
    expect(response.headers.getSetCookie().join(";")).toContain(
      "access-token=",
    );
  });

  it("signs out", async () => {
    const user = await createUser();
    const cookie = await refreshCookie(user.id);

    const response = await request("GET /auth/logout", { cookie });

    expect(response.status).toBe(200);
    expect(await prisma.refreshToken.count()).toBe(0);
  });

  it("signs an existing User in with Google, without accepting an invitation", async () => {
    const user = await createUser();
    const accept = vi.spyOn(InvitationService, "handleInvitationForGoogle");

    const response = await signInWithGoogle(user.email, "an-invitation");

    expect(response.status).toBe(302);
    const location = new URL(response.headers.get("location")!);
    expect(location.href).toContain(config.google.redirectClientUrl);
    expect(location.searchParams.get("user")).toBeTruthy();
    expect(location.searchParams.get("error")).toBeNull();
    expect(accept).not.toHaveBeenCalled();
  });

  it("refuses a Google sign-in that would create a User", async () => {
    const response = await signInWithGoogle("newcomer@example.test");

    expect(response.status).toBe(302);
    const location = new URL(response.headers.get("location")!);
    expect(location.searchParams.get("error")).toBe(READ_ONLY_CODE);
    expect(location.searchParams.get("user")).toBeNull();
    expect(await prisma.user.count()).toBe(0);
    expect(await prisma.dashboard.count()).toBe(0);
    expect(await prisma.refreshToken.count()).toBe(0);
  });
});

describe("with READ_ONLY off", () => {
  it.each(mutatingRoutes)("does not refuse %s as read-only", async (route) => {
    const [method, path] = route.split(" ");
    const response = await request(`${method} ${concrete(path)}`, {
      body: {},
    });

    expect(response.status).not.toBe(503);
  });

  it("reports the flag as off", async () => {
    const response = await request("GET /api/status");

    expect(await response.json()).toEqual({ readOnly: false });
  });

  it("creates a User on a first Google sign-in, as before", async () => {
    const response = await signInWithGoogle("newcomer@example.test");

    expect(response.status).toBe(302);
    const location = new URL(response.headers.get("location")!);
    expect(location.searchParams.get("user")).toBeTruthy();
    expect(await prisma.user.count()).toBe(1);
  });
});
