# Backend Architecture Review & Improvement Plan

**Date:** 2026-04-08  
**Project:** Sunday Heroes — `apps/server`  
**Approach:** Approach C — Layered by severity, 4 phases

---

## Context

Sunday Heroes is a full-stack football league management platform. The backend is Express + TypeScript + Prisma + PostgreSQL, following a Handler → Service → Repository architecture. This document captures the findings from a full architectural review and defines the improvement plan across 4 phases, ordered by risk and blast radius.

The goal is to reach a clean, well-structured foundation ready for production: secure by default, consistent error handling, correct HTTP semantics, no dead code, and a test baseline.

---

## Findings Summary

31 distinct issues identified. Grouped by severity:

| Severity | Count |
|---|---|
| Critical Security | 5 |
| High | 7 |
| Medium | 11 |
| Low / Code Quality | 8 |

---

## Phase 1 — Critical Security Fixes

Targeted changes with minimal blast radius. Must be completed before any public-facing use.

### 1.1 — Stop accepting `userId` from request body / query params

**Problem:** Multiple endpoints accept `userId` as a query param or request body field with no verification — any caller can impersonate any user.

**Affected endpoints:**
- `createCompetition`, `createLeague` — read `userId` from `req.body` instead of JWT
- `getDetailedCompetitions`, `getCompetitionSettings`, `getCompetitionStats` — accept `userId` from query params, unauthenticated
- `getAllDashboardPlayers`, `getAllDashboardPlayersWithDetails`, `getMyDashboardTeammates` — accept `userId` from query params, unauthenticated
- `getDashboardDetails` — accepts `userId` from URL param, unauthenticated

**Fix:**
- Write endpoints: replace `req.body.userId` → `extractUserId(req)` (util already exists)
- Read endpoints that need the caller's identity: add `authenticateToken` middleware, derive `userId` from JWT
- Read endpoints that are intentionally public (e.g. viewing a competition without logging in): explicitly document the decision; remove `userId` param if not needed, or treat it as a filter only (not an identity assertion)

### 1.2 — Verify Google OAuth `id_token` signature

**Problem:** `authService.exchangeGoogleCode` decodes the `id_token` with raw base64 (`Buffer.from(..., 'base64').toString()`) without verifying the signature. A tampered token with valid structure would be accepted.

**Fix:** Replace with `google-auth-library` `OAuth2Client.verifyIdToken({ idToken, audience: clientId })`. This verifies the signature against Google's public keys, validates `aud` and `exp`. Define a typed `GoogleIdTokenPayload` interface for the verified payload.

### 1.3 — Delete test error routes

**Problem:** `/api/test-errors/*` routes are mounted unconditionally in all environments. They expose internal error structure and have no authentication.

**Fix:** Delete the test error route file and handler entirely. No env guard needed — these have no place in the codebase.

### 1.4 — Fix unhandled promise rejections in cron and email sending

**Problem:** Two patterns create unhandled promise rejections that can crash the Node process:
- Cron callbacks throw `AppError` inside async functions — Express cannot catch these
- `setImmediate(async () => { throw ... })` in `sendVotingEmails` / `sendReminderEmails` — the throw is never caught

**Fix:**
- Cron: wrap body in `try/catch`, log errors with `logger.error(...)` instead of throwing
- Email fire-and-forget: remove the `throw`, replace with `logger.error(...)`. Email failures should be logged and monitored, not thrown into void

### 1.5 — Fix moderator ID confusion in `addModeratorToCompetition`

**Problem:** The repository function parameter is named `userId` but stores the value in a `dashboardPlayerId` column. These are IDs from different tables — a `User.id` is being stored where a `DashboardPlayer.id` is expected, causing authorization checks to compare wrong ID types.

**Fix:** Resolve the correct relationship: determine whether the moderator relation expects `User.id` or `DashboardPlayer.id`. If `DashboardPlayer.id` is correct, the service layer must look up the `DashboardPlayer` by `userId` before inserting. Rename parameters to match the actual type throughout the call chain.

### 1.6 — Fix `addMissingPlayers` race condition

**Problem:** `findByNickname` followed by conditional `create` in a loop is a TOCTOU race — two concurrent requests can both find no player and both attempt to create, causing a unique constraint violation.

**Fix:** Replace the find-then-create pattern with Prisma `upsert` or `createMany({ skipDuplicates: true })`. Both are atomic at the DB level.

---

## Phase 2 — Foundation Hardening

Broad but mechanical changes. Touches many files, each change is straightforward.

### 2.1 — Unified error response shape

**Problem:** Three different error response shapes exist:
1. Central error handler: `{ code, message, validation_errors? }`
2. Validation middleware: `{ error, validation_errors }`
3. Rate limiter: `{ message }`

**Fix:** All error responses go through the central error handler via `next(error)`:
- Validation middleware: replace `sendError()` / `sendValidationError()` → `next(new ValidationError(...))`
- Rate limiter: replace `res.status(429).json(...)` → `next(new AppError('Too many requests', 429))`
- Final shape everywhere: `{ code, message, validation_errors? }`

### 2.2 — Fill validation gaps with Zod

**Problem:** Several endpoints have no request validation or incomplete validation.

**Missing schemas to add:**
- `POST /auth/forgot-password` — `z.object({ email: z.string().email() })`
- `POST /api/competitions/:id/moderators` — `z.object({ userId: z.string().uuid() })`
- `DELETE /api/teams/:id` — `z.object({ competitionId: z.string().uuid() })`
- `POST /api/competitions/:id/reset` — no body, but add UUID validation on `:id`

**Existing schema fixes:**
- `PATCH /api/matches/:id` — switch from `createMatchRequestSchema` to `createMatchRequestSchema.partial()` (PATCH should allow partial updates, not require all fields)
- `createMatchRequestSchema` — add `.min(2).max(2)` on the `teams` array (must be exactly 2 teams)
- `createCompetitionRequestSchema` — add `name: z.string().min(1).max(100)`
- All route params (`:id`, `:matchId`, `:competitionId`, `:playerId`) — add a shared param validation middleware using `z.string().uuid()` to return fast 400s instead of hitting Prisma with invalid UUIDs

### 2.3 — Config hardening

**Problems:**
- `DATABASE_URL` is not in `requiredEnvVars` — DB errors surface at first query, not at startup
- `cors.allowedOrigins` is computed but unused (CORS uses `config.client`)
- `EmailService` reads `SMTP_SECURE` directly from `process.env` instead of `config.smtp.secure`
- Config values are existence-checked but not type-validated

**Fixes:**
- Add `DATABASE_URL` to `requiredEnvVars`
- Remove dead `cors.allowedOrigins` computation
- Replace `process.env.SMTP_SECURE` in `EmailService` → `config.smtp.secure`
- Add Zod schema validation to `config.ts` — parse at startup, typed values guaranteed

### 2.4 — HTTP correctness

**Problems:**
- `DELETE /api/competitions/:id` returns 204 with a response body — HTTP 204 must have no body
- `GET /auth/refresh` and `DELETE /auth/refresh` both perform token rotation — wrong methods for token refresh
- `GET /auth/logout` is state-changing — should be POST

**Fixes:**
- `DELETE /api/competitions/:id` → remove the body from the 204 response
- Collapse `GET /auth/refresh` and `DELETE /auth/refresh` → single `POST /auth/refresh`
- `GET /auth/logout` → `POST /auth/logout`
- Update frontend to match the new methods

### 2.5 — Dead code removal

**Remove from `package.json`:**
- `express-validator` — installed, not used (Zod is used instead)
- `passport`, `passport-jwt` — installed, not used
- `@vercel/node` — installed, not a Vercel project
- Move all `@types/*` packages from `dependencies` → `devDependencies`

**Remove from codebase:**
- `createDashboardPlayer` handler — defined but not wired to any route
- `createDashboard` handler — defined but not wired to any route

---

## Phase 3 — Architecture Cleanup

Deeper changes in service and repository layers.

### 3.1 — Transaction correctness in `generateLeagueFixtures`

**Problem:** `MatchRepo.create` is called inside a `prisma.$transaction` block but without the transaction client (`tx`) — match creation happens outside the transaction. If a subsequent step fails, matches are committed but the surrounding state is rolled back, leaving partial fixtures.

**Fix:** Thread `tx` through every repo call inside the transaction. Audit all other service methods that use transactions and verify `tx` is passed consistently to every nested call.

### 3.2 — Fix `createLeague` transaction scope

**Problem:** `TeamService.createTeamInCompetition` is called inside a transaction, but its internal auth checks (`CompetitionAuthRepo` calls) use the global Prisma client, not `tx`.

**Fix:** Extract auth checks outside the transaction, run them first. Open the transaction only for the write operations.

### 3.3 — Eliminate N+1 and redundant queries

| Location | Problem | Fix |
|---|---|---|
| `findByUserWithDeduplication` | Fetches match IDs, then fetches again with full details — 2 queries | Collapse into one query with `include: MATCH_DETAILED_INCLUDE` |
| `findMatchesExpiringSoon` | Post-filters in JavaScript after loading all open matches | Move `reminderDays` comparison into Prisma `where` clause |
| `cleanupExpiredTokensForUser` | Deletes tokens one-by-one in a loop | Replace with `deleteMany({ where: { userId, expiresAt: { lt: new Date() } } })` |
| `deleteByToken` | `findFirst` then `delete by id` — 2 round-trips | Replace with `deleteMany({ where: { token } })` |
| `findCompetitionIdsForUserIncludingAdmin` | 2 sequential queries | Wrap in `Promise.all` |

### 3.4 — Fix team name generation

**Problem:** `team-${Math.floor(Math.random() * 10000)}` has collision risk with no retry logic. A collision throws an unhandled unique constraint error.

**Fix:** Generate deterministic names based on position — `Team A`, `Team B`, `Team C`, etc. (up to 26 teams covers all realistic league sizes). No randomness, no collision risk.

### 3.5 — Fix vote closing logic

**Problem:** `pendingVoters.length - 1 === 0` closes voting based on an implicit assumption that the current voter is still in the pending list. This is fragile and could close voting prematurely or not at all under concurrent access.

**Fix:** After recording the current vote, query the updated pending voters list and check `pendingVoters.length === 0` explicitly. Remove the `-1` assumption.

### 3.6 — Move auth checks out of handlers into services

**Problem:** `competition-moderator-handler` calls `CompetitionAuthRepo.isUserAdmin` directly — handlers should never touch repos.

**Fix:** Move the `isUserAdmin` check into `CompetitionModeratorService`. Handler calls service, service does auth check, service calls repo.

### 3.7 — Fix swallowed errors in invitation service

**Problem:** `handleInvitationForGoogle` and `handleInvitationForAuth` catch specific errors (e.g. `ConflictError`) and re-throw as generic `InvitationError`, losing all context.

**Fix:** Let `ConflictError`, `NotFoundError`, etc. propagate naturally to the global error handler. Only catch truly unexpected errors in a final catch block, and even then, log the original error before re-throwing.

### 3.8 — Fix `DatabaseError.isOperational`

**Problem:** `DatabaseError` is `isOperational: false`, meaning known, well-understood DB errors (unique constraint violations, record not found) become opaque 500s in production.

**Fix:** Set `isOperational: true` on `DatabaseError`. Ensure the Prisma error handler maps codes to appropriate HTTP statuses: `P2002` → 409 Conflict, `P2025` → 404 Not Found, etc.

### 3.9 — Eliminate `any` types

| Location | Fix |
|---|---|
| JWT decoded payload in auth middleware | Define `JwtPayload` interface, cast once at decode site |
| `googleUser: any` in auth-service | Define `GoogleIdTokenPayload` interface matching verified token shape |
| `tx?: any` in service methods | Replace with `Prisma.TransactionClient` from `@prisma/client` |

---

## Phase 4 — Production Readiness

### 4.1 — Global rate limiting

Add a global rate limiter (100 req / 15 min per IP) on all `/api/*` routes. Expensive read endpoints (`getDetailedCompetitions`, player stats, dashboard) get a tighter per-route limiter. All rate limit responses go through the unified error handler (from 2.1).

### 4.2 — API versioning

Prefix all app routes with `/api/v1/`. Auth routes stay at `/auth/` (not versioned). This is a one-line change in `api.ts` but requires coordinated frontend update.

### 4.3 — Request body size limit

Set an explicit limit on `express.json()`: `{ limit: '50kb' }`. Current default of 100kb with no explicit cap is a large payload attack vector.

### 4.4 — Test foundation

Set up Jest with `jest.config.ts` for the server. Three layers:

**Unit tests** (mock repo layer) — priority targets:
- `VoteService` — complex closing logic
- `AuthService` — Google OAuth, token rotation
- `LeagueService` — fixture generation, transaction correctness

**Integration tests** (test DB with `prisma.$transaction` rollback pattern) — priority:
- Full auth flow (register, login, refresh, logout)
- Competition creation and deletion
- Match submission and vote flow

**Error path tests** — validation failures, unauthorized access, not-found scenarios

No coverage percentage target initially — establish the pattern and cover critical paths first.

### 4.5 — Structured logging audit

- Replace any remaining `console.log` with `logger.info/error/warn`
- Verify request logging middleware captures method, path, status, duration
- Verify error logging includes structured context (`userId`, `competitionId`) where available
- Audit pino serializers to confirm no sensitive fields (passwords, tokens, raw emails) appear in logs

### 4.6 — Dependency hygiene

- Run `npm audit`, resolve all high/critical vulnerabilities
- Replace `axios` (used for a single Google token exchange call) with Node built-in `fetch` (Node 18+) — removes a production dependency
- Pin major versions in `package.json` — remove `^` from critical deps (`express`, `prisma`, `jsonwebtoken`)

### 4.7 — Environment validation with Zod

Upgrade `config.ts` from existence-check to full Zod schema parse at startup. Typed, validated, with explicit defaults where appropriate. Gives compile-time and runtime guarantees on every config value.

---

## Issue Reference Table

| # | Issue | Phase | Severity |
|---|---|---|---|
| 1 | `userId` accepted from body/query params — user impersonation | 1.1 | Critical |
| 2 | Google `id_token` not signature-verified | 1.2 | Critical |
| 3 | Test error routes exposed in production | 1.3 | Critical |
| 4 | Unhandled promise rejections in cron and email | 1.4 | Critical |
| 5 | Moderator ID confusion (`userId` stored as `dashboardPlayerId`) | 1.5 | Critical |
| 6 | Race condition in `addMissingPlayers` | 1.6 | High |
| 7 | Inconsistent error response shapes (3 formats) | 2.1 | High |
| 8 | Missing Zod validation on 8+ endpoints | 2.2 | High |
| 9 | `DATABASE_URL` not in required env vars | 2.3 | Medium |
| 10 | Dead config code (`cors.allowedOrigins`) | 2.3 | Low |
| 11 | `SMTP_SECURE` bypasses config abstraction | 2.3 | Low |
| 12 | 204 response with body | 2.4 | Medium |
| 13 | Wrong HTTP methods for refresh/logout | 2.4 | Medium |
| 14 | Dead dependencies (`express-validator`, `passport`, etc.) | 2.5 | Low |
| 15 | `@types/*` in production dependencies | 2.5 | Low |
| 16 | Unwired handler stubs | 2.5 | Low |
| 17 | `MatchRepo.create` outside transaction in fixture generation | 3.1 | High |
| 18 | Auth checks inside transaction in `createLeague` | 3.2 | Medium |
| 19 | N+1 and redundant queries (5 locations) | 3.3 | Medium |
| 20 | Team name collision risk | 3.4 | Medium |
| 21 | Fragile vote closing logic | 3.5 | High |
| 22 | Auth check in handler instead of service | 3.6 | Medium |
| 23 | Swallowed errors in invitation service | 3.7 | Medium |
| 24 | `DatabaseError.isOperational: false` | 3.8 | Medium |
| 25 | `any` types in auth middleware and services | 3.9 | Low |
| 26 | No global rate limiting | 4.1 | High |
| 27 | No API versioning | 4.2 | Low |
| 28 | No request body size limit | 4.3 | Medium |
| 29 | 0% test coverage | 4.4 | High |
| 30 | Logging audit needed | 4.5 | Medium |
| 31 | Dependency hygiene (audit, axios, version pinning) | 4.6 | Low |
