# Phase 1: Critical Security Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the 5 critical and 1 high-severity security issues in the Sunday Heroes backend before any public-facing use.

**Architecture:** All fixes are surgical — touching existing files without restructuring. The Handler → Service → Repository layering is preserved. No new files are created except where explicitly noted. No tests exist yet (test infrastructure is Phase 4), so verification is done via manual curl/type-check.

**Tech Stack:** Express, TypeScript, Prisma, Zod, jsonwebtoken, node-cron, google-auth-library (new install)

---

## File Map

| File | Change |
|---|---|
| `apps/server/src/schemas/create-competition-request-schema.ts` | Remove `userId` field |
| `apps/server/src/services/competition-service.ts` | Accept `userId` as separate param in `createCompetition` |
| `apps/server/src/handlers/competition.ts` | Use `extractUserId(req)` in write + read endpoints |
| `apps/server/src/handlers/league.ts` | Use `extractUserId(req)` instead of `req.body.userId` |
| `apps/server/src/handlers/player.ts` | Use `extractUserId(req)` instead of `req.query.userId` |
| `apps/server/src/handlers/dashboard.ts` | Use `extractUserId(req)` instead of `req.params.id` |
| `apps/server/src/routes/api/competition-routes.ts` | Add `authenticateToken` to read endpoints |
| `apps/server/src/routes/api/player-routes.ts` | Add `authenticateToken` to all player read routes |
| `apps/server/src/routes/api/dashboard-routes.ts` | Add `authenticateToken`, change `/:id` → `/` |
| `apps/server/src/services/auth-service.ts` | Verify Google `id_token` with `google-auth-library` |
| `apps/server/src/routes/api.ts` | Remove test route import and mount |
| `apps/server/src/routes/api/test-routes.ts` | Delete file |
| `apps/server/src/services/match/match-expired-service.ts` | Log cron errors instead of throwing |
| `apps/server/src/services/match/match-voting-service.ts` | Log email errors inside `setImmediate` instead of throwing |
| `apps/server/src/services/competition-moderator-service.ts` | Look up `DashboardPlayer` by `userId` before inserting moderator |
| `apps/server/src/repositories/competition/competition-moderator-repo.ts` | Rename param to `dashboardPlayerId` for clarity |
| `apps/server/src/services/dashboard-player-service.ts` | Replace `findByNickname` + `create` loop with `createMany` |

---

## Task 1: Remove `userId` from the competition creation schema

`userId` is currently a required field in the Zod schema but must come from the JWT, not the client.

**Files:**
- Modify: `apps/server/src/schemas/create-competition-request-schema.ts`

- [ ] **Step 1.1: Remove `userId` from the schema**

Replace the entire file content:

```typescript
import { CompetitionType } from "@repo/shared-types";
import { z } from "zod";

export const createCompetitionRequestSchema = z
  .object({
    name: z.string().min(1).max(100),
    type: z.nativeEnum(CompetitionType),
    trackSeasons: z.boolean(),
    currentSeason: z.coerce.number().min(1).optional(),
    minPlayers: z.coerce.number().min(4).optional(),
    votingEnabled: z.boolean(),
    votingPeriodDays: z.coerce.number().optional(),
    knockoutVotingPeriodDays: z.coerce.number().optional(),
    reminderDays: z.coerce.number().optional(),
  })
  .refine(
    (data) =>
      !data.votingEnabled ||
      (data.votingPeriodDays !== undefined && data.reminderDays !== undefined),
    {
      message: "Voting period and Reminder are required when voting is enabled",
      path: ["voting_period_days"],
    }
  )
  .refine(
    (data) =>
      data.reminderDays === undefined ||
      data.votingPeriodDays === undefined ||
      data.reminderDays < data.votingPeriodDays,
    {
      message: "Reminder days must be less than voting period days",
      path: ["reminderDays", "votingPeriodDays"],
    }
  );

export type createCompetitionRequest = z.infer<
  typeof createCompetitionRequestSchema
>;
```

- [ ] **Step 1.2: Update `CompetitionService.createCompetition` to accept `userId` separately**

In `apps/server/src/services/competition-service.ts`, find `static async createCompetition(data: createCompetitionRequest)` and change its signature and body:

```typescript
static async createCompetition(data: createCompetitionRequest, userId: string) {
  const dashboardId = await DashboardService.getDashboardIdFromUserId(userId);
  if (!dashboardId) {
    throw new NotFoundError("Dashboard");
  }

  const competitionToAdd = transformAddCompetitionRequestToService(
    data,
    dashboardId
  );
  return await CompetitionRepo.create(competitionToAdd);
}
```

- [ ] **Step 1.3: Update `LeagueService.createLeague` to pass `userId` through to `CompetitionService`**

In `apps/server/src/services/league-service.ts`, find line `const competition = await CompetitionService.createCompetition(request);` and change to:

```typescript
const competition = await CompetitionService.createCompetition(request, userId);
```

- [ ] **Step 1.4: Check TypeScript compiles**

```bash
cd apps/server && npx tsc --noEmit
```

Expected: no errors related to `userId` on `createCompetitionRequest`.

- [ ] **Step 1.5: Commit**

```bash
git add apps/server/src/schemas/create-competition-request-schema.ts \
        apps/server/src/services/competition-service.ts \
        apps/server/src/services/league-service.ts
git commit -m "fix(security): remove userId from competition schema, derive from JWT in service"
```

---

## Task 2: Fix `createCompetition` and `createLeague` handlers to use JWT identity

Both handlers currently read `userId` from `req.body`. They must use `extractUserId(req)` instead.

**Files:**
- Modify: `apps/server/src/handlers/competition.ts`
- Modify: `apps/server/src/handlers/league.ts`

- [ ] **Step 2.1: Fix `createCompetition` handler**

In `apps/server/src/handlers/competition.ts`, replace the `createCompetition` function entirely:

```typescript
export const createCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = extractUserId(req);
    const data: createCompetitionRequest = req.body;

    logger.info({ userId, type: data.type }, "Create competition attempt");

    const competition = await CompetitionService.createCompetition(data, userId);

    logger.info(
      { userId, competitionId: competition.id },
      "Competition created",
    );

    if (data.type === CompetitionType.DUEL) {
      await TeamService.createTeamInCompetition("Home", competition.id, userId);
      await TeamService.createTeamInCompetition("Away", competition.id, userId);

      logger.info(
        { competitionId: competition.id },
        "Teams created for duel competition",
      );
    }

    sendSuccess(res, { competition }, 201);
  } catch (error) {
    next(error);
  }
};
```

- [ ] **Step 2.2: Fix `createLeague` handler**

In `apps/server/src/handlers/league.ts`, replace the `createLeague` function entirely:

```typescript
export const createLeague = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = extractUserId(req);
    const data: CreateLeagueRequest = req.body;

    logger.info({ userId }, "Create league attempt");

    const league = await LeagueService.createLeague(data, userId);

    logger.info({ userId, leagueId: league.competition.id }, "League created");
    sendSuccess(res, league, 201);
  } catch (error) {
    next(error);
  }
};
```

- [ ] **Step 2.3: Check TypeScript compiles**

```bash
cd apps/server && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2.4: Commit**

```bash
git add apps/server/src/handlers/competition.ts \
        apps/server/src/handlers/league.ts
git commit -m "fix(security): derive userId from JWT in createCompetition and createLeague handlers"
```

---

## Task 3: Add authentication to competition read endpoints

`getDetailedCompetitions` and `getCompetitionSettings` accept `userId` from unauthenticated query params. Fix: require auth and derive from JWT.

**Files:**
- Modify: `apps/server/src/routes/api/competition-routes.ts`
- Modify: `apps/server/src/handlers/competition.ts`

- [ ] **Step 3.1: Add `authenticateToken` to competition read routes that use userId**

In `apps/server/src/routes/api/competition-routes.ts`, replace the file entirely:

```typescript
import { Router } from "express";
import {
  createCompetition,
  deleteCompetition,
  getCompetitionInfo,
  getCompetitionStats,
  getCompetitionSettings,
  getCompetitionTeams,
  getDetailedCompetitions,
  resetCompetition,
} from "../../handlers/competition";
import {
  addModeratorToCompetition,
  removeModeratorFromCompetition,
} from "../../handlers/competition-moderator";
import { validateRequestBody } from "../../middleware/validation-middleware";
import { createCompetitionRequestSchema } from "../../schemas/create-competition-request-schema";
import { authenticateToken } from "../../middleware/authentication-middleware";

const router = Router();

router.get("/detailed", authenticateToken, getDetailedCompetitions);
router.get("/info", getCompetitionInfo);
router.get("/settings", authenticateToken, getCompetitionSettings);
router.get("/teams", getCompetitionTeams);
router.get("/stats", authenticateToken, getCompetitionStats);

router.post(
  "/",
  authenticateToken,
  validateRequestBody(createCompetitionRequestSchema),
  createCompetition
);
router.post("/:id/reset", authenticateToken, resetCompetition);
router.delete("/:id", authenticateToken, deleteCompetition);

router.post("/:id/moderators", authenticateToken, addModeratorToCompetition);
router.delete(
  "/moderators/:moderatorId",
  authenticateToken,
  removeModeratorFromCompetition
);

export default router;
```

- [ ] **Step 3.2: Update handlers to derive userId from JWT**

In `apps/server/src/handlers/competition.ts`, replace `getDetailedCompetitions`, `getCompetitionSettings`, and `getCompetitionStats`:

```typescript
export const getDetailedCompetitions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = extractUserId(req);
    const page = parseInt(req.query.page?.toString() || "0", 10);
    const limit = parseInt(req.query.limit?.toString() || "10", 10);
    const type = req.query.type as CompetitionType;
    const search = req.query.search?.toString();

    const result = await CompetitionService.getDetailedCompetitions(userId, {
      page,
      limit,
      type,
      search,
    });

    res.setHeader("X-Total-Count", result.totalCount.toString());
    res.setHeader("X-Total-Pages", result.totalPages.toString());
    res.setHeader("X-Current-Page", page.toString());

    sendSuccess(res, result.competitions);
  } catch (error) {
    next(error);
  }
};

export const getCompetitionStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const competitionId = getRequiredQuery(req, "compId");
    const userId = extractUserId(req);

    const competition = await CompetitionService.getCompetitionStats(
      competitionId,
      userId,
    );
    sendSuccess(res, competition);
  } catch (error) {
    next(error);
  }
};

export const getCompetitionSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const competitionId = getRequiredQuery(req, "compId");
    const userId = extractUserId(req);

    const competition = await CompetitionService.getCompetitionSettings(
      competitionId,
      userId,
    );
    sendSuccess(res, competition);
  } catch (error) {
    next(error);
  }
};
```

- [ ] **Step 3.3: Check TypeScript compiles**

```bash
cd apps/server && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3.4: Commit**

```bash
git add apps/server/src/routes/api/competition-routes.ts \
        apps/server/src/handlers/competition.ts
git commit -m "fix(security): require auth on competition read endpoints, derive userId from JWT"
```

---

## Task 4: Add authentication to player and dashboard endpoints

All three player read routes and the dashboard route accept `userId` from unauthenticated params.

**Files:**
- Modify: `apps/server/src/routes/api/player-routes.ts`
- Modify: `apps/server/src/routes/api/dashboard-routes.ts`
- Modify: `apps/server/src/handlers/player.ts`
- Modify: `apps/server/src/handlers/dashboard.ts`

- [ ] **Step 4.1: Add `authenticateToken` to player routes**

Replace `apps/server/src/routes/api/player-routes.ts` entirely:

```typescript
import { Router } from "express";
import {
  getAllDashboardPlayers,
  getAllDashboardPlayersWithDetails,
  getMyDashboardTeammates,
} from "../../handlers/player";
import {
  getPerformanceChart,
  getPlayerStats,
  getStatsByCompetition,
  getTopCompetitions,
  getTopMatches,
  getTopTeammates,
} from "../../handlers/player-stats";
import { authenticateToken } from "../../middleware/authentication-middleware";

const router = Router();

router.get("/", authenticateToken, getAllDashboardPlayersWithDetails);
router.get("/teammates", authenticateToken, getMyDashboardTeammates);
router.get("/basic", authenticateToken, getAllDashboardPlayers);

router.get("/:playerId/stats", getPlayerStats);
router.get("/:playerId/stats/performance/:competitionId", getPerformanceChart);
router.get("/:playerId/stats/top-matches", getTopMatches);
router.get("/:playerId/stats/top-competitions", getTopCompetitions);
router.get("/:playerId/stats/top-teammates", getTopTeammates);
router.get("/:playerId/stats/competitions", getStatsByCompetition);

export default router;
```

- [ ] **Step 4.2: Add `authenticateToken` to the dashboard route and change path from `/:id` to `/`**

Replace `apps/server/src/routes/api/dashboard-routes.ts` entirely:

```typescript
import { Router } from "express";
import { getDashboardDetails } from "../../handlers/dashboard";
import { authenticateToken } from "../../middleware/authentication-middleware";

const router = Router();

router.get("/", authenticateToken, getDashboardDetails);

export default router;
```

- [ ] **Step 4.3: Fix player handlers to derive userId from JWT**

Replace the three handler functions in `apps/server/src/handlers/player.ts`:

```typescript
export const getAllDashboardPlayers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = extractUserId(req);
    const competitionId = req.query.competitionId?.toString();

    if (!competitionId) {
      throw new BadRequestError("competitionId query parameter is required");
    }

    const query = req.query.query?.toString();

    const players = await DashboardPlayerService.getDashboardPlayersByQuery(
      userId,
      competitionId,
      query || "",
    );
    sendSuccess(res, players);
  } catch (error) {
    next(error);
  }
};

export const getAllDashboardPlayersWithDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = extractUserId(req);

    const page = parseInt(req.query.page?.toString() || "0", 10);
    const limit = parseInt(req.query.limit?.toString() || "10", 10);
    const search = req.query.search?.toString();

    const result = await DashboardPlayerService.getDashboardPlayers(userId, {
      page,
      limit,
      search,
    });
    res.setHeader("X-Total-Count", result.totalCount.toString());
    res.setHeader("X-Total-Pages", result.totalPages.toString());
    res.setHeader("X-Current-Page", page.toString());

    sendSuccess(res, result.players);
  } catch (error) {
    next(error);
  }
};

export const getMyDashboardTeammates = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = extractUserId(req);

    const page = parseInt(req.query.page?.toString() || "0", 10);
    const limit = parseInt(req.query.limit?.toString() || "10", 10);
    const search = req.query.search?.toString();

    const result = await DashboardPlayerService.getDashboardPlayersForUser(
      userId,
      {
        page,
        limit,
        search,
      },
    );
    res.setHeader("X-Total-Count", result.totalCount.toString());
    res.setHeader("X-Total-Pages", result.totalPages.toString());
    res.setHeader("X-Current-Page", page.toString());

    sendSuccess(res, result.players);
  } catch (error) {
    next(error);
  }
};
```

Note: the `ValidationError` import in `handlers/player.ts` will become unused after Task 11 removes `createDashboardPlayer`. Leave it for now; Task 11 will clean it up.

- [ ] **Step 4.4: Fix dashboard handler to derive userId from JWT**

Replace the `getDashboardDetails` function in `apps/server/src/handlers/dashboard.ts`:

```typescript
export const getDashboardDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = extractUserId(req);
    const dashboardResponse =
      await DashboardService.getDashboardPlayerDetailsForUser(userId);
    sendSuccess(res, dashboardResponse);
  } catch (error) {
    next(error);
  }
};
```

- [ ] **Step 4.5: Check TypeScript compiles**

```bash
cd apps/server && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4.6: Commit**

```bash
git add apps/server/src/routes/api/player-routes.ts \
        apps/server/src/routes/api/dashboard-routes.ts \
        apps/server/src/handlers/player.ts \
        apps/server/src/handlers/dashboard.ts
git commit -m "fix(security): require auth on player and dashboard endpoints, derive userId from JWT"
```

---

## Task 5: Verify Google OAuth `id_token` signature with `google-auth-library`

The current implementation decodes the `id_token` via raw base64 without verifying the signature. Replace with proper verification.

**Files:**
- Modify: `apps/server/package.json` (install dependency)
- Modify: `apps/server/src/services/auth-service.ts`

- [ ] **Step 5.1: Install `google-auth-library`**

```bash
cd apps/server && npm install google-auth-library
```

Expected: package added to `dependencies` in `package.json`.

- [ ] **Step 5.2: Define a typed payload interface**

At the top of `apps/server/src/services/auth-service.ts`, add the following interface (after the imports):

```typescript
interface GoogleIdTokenPayload {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
  email_verified: boolean;
}
```

- [ ] **Step 5.3: Add the `google-auth-library` import**

At the top of `apps/server/src/services/auth-service.ts`, add:

```typescript
import { OAuth2Client } from "google-auth-library";
```

And remove the `import axios from "axios";` line (axios is no longer needed here).

- [ ] **Step 5.4: Replace `exchangeGoogleCode` with signature-verified implementation**

Replace the entire `exchangeGoogleCode` static method:

```typescript
static async exchangeGoogleCode(code: string): Promise<GoogleIdTokenPayload> {
  const client = new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri,
  );

  const { tokens } = await client.getToken(code);

  if (!tokens.id_token) {
    throw new AuthenticationError("Google did not return an id_token");
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: config.google.clientId,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw new AuthenticationError("Invalid Google token payload");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    given_name: payload.given_name ?? "",
    family_name: payload.family_name ?? "",
    email_verified: payload.email_verified ?? false,
  };
}
```

- [ ] **Step 5.5: Update `findOrCreateUser` to use the typed payload**

Replace the `findOrCreateUser` signature:

```typescript
static async findOrCreateUser(googleUser: GoogleIdTokenPayload): Promise<User> {
```

- [ ] **Step 5.6: Check TypeScript compiles**

```bash
cd apps/server && npx tsc --noEmit
```

Expected: no errors. If `axios` is still imported elsewhere in `auth-service.ts`, keep the import; otherwise remove it. The `axios` package itself will be removed in Phase 2 cleanup.

- [ ] **Step 5.7: Commit**

```bash
git add apps/server/package.json \
        apps/server/package-lock.json \
        apps/server/src/services/auth-service.ts
git commit -m "fix(security): verify Google id_token signature using google-auth-library"
```

---

## Task 6: Delete test error routes

These routes expose internal error structure with no auth in all environments.

**Files:**
- Delete: `apps/server/src/routes/api/test-routes.ts`
- Modify: `apps/server/src/routes/api.ts`

- [ ] **Step 6.1: Remove the test route import and mount from `api.ts`**

Replace `apps/server/src/routes/api.ts` entirely:

```typescript
import { Router } from "express";
import dashboardRoutes from "./api/dashboard-routes";
import competitionRoutes from "./api/competition-routes";
import matchRoutes from "./api/match-routes";
import playerRoutes from "./api/player-routes";
import voteRoutes from "./api/vote-routes";
import invitationRoutes from "./api/invitation-routes";
import teamRoutes from "./api/team-routes";
import leagueRoutes from "./api/league-routes";

const router = Router();

router.use("/dashboard", dashboardRoutes);
router.use("/competitions", competitionRoutes);
router.use("/matches", matchRoutes);
router.use("/players", playerRoutes);
router.use("/votes", voteRoutes);
router.use("/invitations", invitationRoutes);
router.use("/teams", teamRoutes);
router.use("/leagues", leagueRoutes);

export default router;
```

- [ ] **Step 6.2: Delete the test routes file**

```bash
rm apps/server/src/routes/api/test-routes.ts
```

- [ ] **Step 6.3: Check TypeScript compiles**

```bash
cd apps/server && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6.4: Commit**

```bash
git add apps/server/src/routes/api.ts
git rm apps/server/src/routes/api/test-routes.ts
git commit -m "fix(security): delete test error routes"
```

---

## Task 7: Fix unhandled promise rejections in cron tasks

Cron callbacks throw `AppError` inside async callbacks. Express cannot catch these — they become process-level unhandled rejections that can crash Node.

**Files:**
- Modify: `apps/server/src/services/match/match-expired-service.ts`

- [ ] **Step 7.1: Replace throws with logger.error in cron callbacks**

Replace the entire file:

```typescript
import cron from "node-cron";
import { MatchService } from "./match-service";
import { MatchVotingService } from "./match-voting-service";
import logger from "../../logger";

export const setupScheduledTasks = () => {
  cron.schedule("0 0 * * *", async () => {
    logger.info("Running scheduled task: closeExpiredMatchVoting");
    try {
      await MatchService.closeExpiredVoting();
    } catch (error) {
      logger.error(
        { err: error },
        "Scheduled task failed: closeExpiredMatchVoting",
      );
    }
  });

  cron.schedule("00 12 * * *", async () => {
    logger.info("Running scheduled task: sendReminderEmails");
    try {
      await MatchVotingService.sendReminderEmails();
    } catch (error) {
      logger.error(
        { err: error },
        "Scheduled task failed: sendReminderEmails",
      );
    }
  });
};
```

- [ ] **Step 7.2: Check TypeScript compiles**

```bash
cd apps/server && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7.3: Commit**

```bash
git add apps/server/src/services/match/match-expired-service.ts
git commit -m "fix(security): log cron errors instead of throwing to prevent unhandled promise rejections"
```

---

## Task 8: Fix unhandled promise rejections in email fire-and-forget

`sendVotingEmails` and `sendReminderEmails` throw inside `setImmediate(async () => {...})`. Errors thrown inside async `setImmediate` callbacks are unhandled promise rejections.

**Files:**
- Modify: `apps/server/src/services/match/match-voting-service.ts`

- [ ] **Step 8.1: Replace throws with logger.error inside setImmediate callbacks**

In `apps/server/src/services/match/match-voting-service.ts`:

Replace `sendVotingEmails`:

```typescript
private static sendVotingEmails(
  matchDetails: MatchVotingEmailData,
  matchId: string,
  dashboardPlayers: DashboardPlayerBasic[],
) {
  setImmediate(async () => {
    try {
      const playersWithEmails = dashboardPlayers.filter(
        (player): player is typeof player & { user: { email: string } } =>
          Boolean(player.user?.email),
      );

      const emailPromises = playersWithEmails.map((player) =>
        EmailService.sendVotingInvitation(
          player.user.email,
          player.nickname,
          matchId,
          player.id,
          matchDetails,
        ),
      );

      await Promise.all(emailPromises);
    } catch (error) {
      logger.error({ err: error, matchId }, "Error sending match voting emails");
    }
  });
}
```

Replace `sendReminderEmails`:

```typescript
static async sendReminderEmails() {
  setImmediate(async () => {
    try {
      const matches = await MatchRepo.findMatchesExpiringSoon();

      for (const match of matches) {
        const notVotedPlayers = match.matchPlayers.filter((mp) => {
          const votesGiven = match.playerVotes.filter(
            (v) => v.voterId === mp.dashboardPlayer.id,
          );
          return !votesGiven.length && mp.dashboardPlayer.user?.email;
        });

        for (const mp of notVotedPlayers) {
          await EmailService.sendVotingInvitation(
            mp.dashboardPlayer.user!.email,
            mp.dashboardPlayer.nickname,
            match.id,
            mp.dashboardPlayer.id,
            {
              competitionName: match.competition.name,
              competitionVotingDays: match.competition.votingPeriodDays ?? 7,
              reminderDays: match.competition.reminderDays ?? 3,
              date: match.date ?? new Date(),
              homeTeam:
                match.matchTeams.find((t) => t.isHome)?.team.name ?? "",
              awayTeam:
                match.matchTeams.find((t) => !t.isHome)?.team.name ?? "",
              homeScore: match.homeTeamScore,
              awayScore: match.awayTeamScore,
            },
            true,
          );
        }
      }
    } catch (error) {
      logger.error({ err: error }, "Error sending reminder emails");
    }
  });
}
```

Also remove the `AppError` import from `match-voting-service.ts` if it is no longer used:

```typescript
// Remove this line if AppError is no longer referenced:
import { AppError } from "../../utils/errors";
```

- [ ] **Step 8.2: Check TypeScript compiles**

```bash
cd apps/server && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8.3: Commit**

```bash
git add apps/server/src/services/match/match-voting-service.ts
git commit -m "fix(security): log email errors inside setImmediate instead of throwing"
```

---

## Task 9: Fix moderator ID confusion

The `CompetitionModerator` table's `dashboardPlayerId` column stores a `DashboardPlayer.id`. The current handler passes a `User.id` (`req.body.userId`), but the service passes it directly to the repo which stores it as `dashboardPlayerId`. This means a `User.id` is being stored where a `DashboardPlayer.id` is expected — all moderator checks will silently fail.

The fix: the service looks up the `DashboardPlayer` for the given `userId` in the competition's dashboard, then uses that player's id.

**Files:**
- Modify: `apps/server/src/services/competition-moderator-service.ts`
- Modify: `apps/server/src/repositories/competition/competition-moderator-repo.ts`

- [ ] **Step 9.1: Rename `userId` to `dashboardPlayerId` in `CompetitionModeratorRepo` for clarity**

In `apps/server/src/repositories/competition/competition-moderator-repo.ts`, update `addModeratorToCompetition` to use the correctly-named parameter:

```typescript
static async addModeratorToCompetition(
  competitionId: string,
  dashboardPlayerId: string,
  tx?: Prisma.TransactionClient
): Promise<void> {
  try {
    const prismaClient = tx || prisma;
    await prismaClient.competitionModerator.create({
      data: {
        competitionId,
        dashboardPlayerId,
      },
    });
  } catch (error) {
    throw PrismaErrorHandler.handle(
      error,
      "CompetitionModeratorRepo.addModeratorToCompetition"
    );
  }
}
```

Also update `isUserModerator` to use `dashboardPlayerId` parameter name:

```typescript
static async isUserModerator(
  competitionId: string,
  dashboardPlayerId: string,
  tx?: Prisma.TransactionClient
): Promise<boolean> {
  try {
    const prismaClient = tx || prisma;
    const count = await prismaClient.competitionModerator.count({
      where: {
        competitionId,
        dashboardPlayerId,
      },
    });
    return count > 0;
  } catch (error) {
    throw PrismaErrorHandler.handle(
      error,
      "CompetitionModeratorRepo.isUserModerator"
    );
  }
}
```

- [ ] **Step 9.2: Update `CompetitionModeratorService.addModeratorToCompetition` to resolve userId → dashboardPlayerId**

The service receives `userId` (a `User.id`) from the handler and must look up the correct `DashboardPlayer.id` in the competition's dashboard before inserting.

Replace the entire `apps/server/src/services/competition-moderator-service.ts` file:

```typescript
import { CompetitionAuthRepo } from "../repositories/competition/competition-auth-repo";
import { CompetitionModeratorRepo } from "../repositories/competition/competition-moderator-repo";
import { CompetitionRepo } from "../repositories/competition/competition-repo";
import { DashboardPlayerRepo } from "../repositories/dashboard-player/dashboard-player-repo";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from "../utils/errors";

export class CompetitionModeratorService {
```

Then replace the `addModeratorToCompetition` method (keep `removeModeratorFromCompetition` as-is):

```typescript
static async addModeratorToCompetition(
  competitionId: string,
  userId: string
) {
  // Resolve the competition's dashboard so we can find the DashboardPlayer
  const competition = await CompetitionRepo.findById(competitionId);
  if (!competition) {
    throw new NotFoundError("Competition");
  }

  // Find the DashboardPlayer for this user in the competition's dashboard
  const dashboardPlayer = await DashboardPlayerRepo.findByUserId(
    userId,
    competition.dashboardId
  );
  if (!dashboardPlayer) {
    throw new NotFoundError(
      "Player — the user must be a registered player in this competition's dashboard"
    );
  }

  const isModerator = await CompetitionModeratorRepo.isUserModerator(
    competitionId,
    dashboardPlayer.id
  );
  if (isModerator) {
    throw new ConflictError(
      "User is already a moderator of this competition"
    );
  }

  await CompetitionModeratorRepo.addModeratorToCompetition(
    competitionId,
    dashboardPlayer.id
  );
}
```

- [ ] **Step 9.3: Check TypeScript compiles**

```bash
cd apps/server && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9.4: Commit**

```bash
git add apps/server/src/repositories/competition/competition-moderator-repo.ts \
        apps/server/src/services/competition-moderator-service.ts
git commit -m "fix(security): resolve userId to dashboardPlayerId when adding competition moderator"
```

---

## Task 10: Fix `addMissingPlayers` race condition

The current `find-then-create` loop has a TOCTOU race: two concurrent requests can both fail to find a player and both attempt to create it, causing a unique constraint violation. Replace with `createMany({ skipDuplicates: true })`.

**Files:**
- Modify: `apps/server/src/services/dashboard-player-service.ts`

- [ ] **Step 10.1: Replace the find-then-create loop with `createMany`**

In `apps/server/src/services/dashboard-player-service.ts`, replace the `addMissingPlayers` method:

```typescript
static async addMissingPlayers(
  playerNames: string[],
  dashboardId: string,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  if (playerNames.length === 0) return;

  const records = playerNames.map((nickname) => ({
    userId: null,
    nickname,
    dashboardId,
    createdAt: new Date(),
  }));

  await DashboardPlayerRepo.createMany(records, tx);
}
```

Note: `DashboardPlayerRepo.createMany` already exists and calls `prisma.dashboardPlayer.createMany({ data })`. Prisma's `createMany` does not support `skipDuplicates` on all databases, but PostgreSQL supports it. Add the `skipDuplicates` flag in the repo:

In `apps/server/src/repositories/dashboard-player/dashboard-player-repo.ts`, update `createMany`:

```typescript
static async createMany(
  data: Omit<DashboardPlayer, "id">[],
  tx?: Prisma.TransactionClient
): Promise<{ count: number }> {
  try {
    const prismaClient = tx || prisma;
    return await prismaClient.dashboardPlayer.createMany({
      data,
      skipDuplicates: true,
    });
  } catch (error) {
    throw PrismaErrorHandler.handle(error, "DashboardPlayerRepo.createMany");
  }
}
```

Also add the `Prisma` import to `dashboard-player-service.ts` if not already present:

```typescript
import { Prisma } from "@prisma/client";
```

- [ ] **Step 10.2: Check TypeScript compiles**

```bash
cd apps/server && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 10.3: Commit**

```bash
git add apps/server/src/services/dashboard-player-service.ts \
        apps/server/src/repositories/dashboard-player/dashboard-player-repo.ts
git commit -m "fix(security): replace addMissingPlayers find-then-create loop with atomic createMany"
```

---

## Task 11: Delete dead handler stubs

`createDashboardPlayer` and `createDashboard` are defined in handler files but not wired to any route. Remove them to avoid confusion.

**Files:**
- Modify: `apps/server/src/handlers/player.ts`
- Modify: `apps/server/src/handlers/dashboard.ts`

- [ ] **Step 11.1: Remove `createDashboardPlayer` from player handler**

In `apps/server/src/handlers/player.ts`, delete the entire `createDashboardPlayer` export function.

Then update the imports at the top — remove `ValidationError` (only used by the deleted function). Keep `extractUserId`, `BadRequestError`, `DashboardPlayerService`, `sendSuccess`, `logger`, and the express imports since the remaining handlers use them:

```typescript
import { Request, Response, NextFunction } from "express";
import { DashboardPlayerService } from "../services/dashboard-player-service";
import { sendSuccess } from "../utils/response-utils";
import { extractUserId } from "../utils/request-utils";
import { BadRequestError } from "../utils/errors";
import logger from "../logger";
```

- [ ] **Step 11.2: Remove `createDashboard` from dashboard handler**

In `apps/server/src/handlers/dashboard.ts`, delete the entire `createDashboard` export function.

Then update the imports — remove `extractUserId`, `ValidationError`, and `logger` (all only used by the deleted function):

```typescript
import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard-service";
import { sendSuccess } from "../utils/response-utils";
```

- [ ] **Step 11.3: Check TypeScript compiles**

```bash
cd apps/server && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 11.4: Final Phase 1 commit**

```bash
git add apps/server/src/handlers/player.ts \
        apps/server/src/handlers/dashboard.ts
git commit -m "chore: remove unwired createDashboardPlayer and createDashboard handler stubs"
```

---

## Phase 1 Done — Verification Checklist

Before marking Phase 1 complete, verify:

- [ ] `npx tsc --noEmit` passes with zero errors from `apps/server`
- [ ] `GET /api/competitions/detailed` without a valid access-token cookie returns 401
- [ ] `POST /api/competitions` with a valid token no longer requires `userId` in the body
- [ ] `GET /api/test-errors/server-error` returns 404 (route deleted)
- [ ] Server starts without errors: `npm run dev` from repo root
- [ ] No `throw new AppError(...)` inside cron callbacks (check `match-expired-service.ts`)
- [ ] No `throw new AppError(...)` inside `setImmediate` callbacks (check `match-voting-service.ts`)
