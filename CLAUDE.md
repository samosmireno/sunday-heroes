# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands are run from the repo root unless otherwise noted.

```bash
# Development (runs client + server concurrently)
npm run dev

# Build all packages
npm run build

# Run all tests
npm run test

# Type checking
npm run check-types

# Lint
npm run lint

# Format
npm run format
```

### Per-workspace commands (run from the workspace directory)

```bash
# Server only
cd apps/server && npm run dev

# Client only
cd apps/client && npm run dev

# Run a single test file (server)
cd apps/server && npx jest path/to/test.ts

# Run a single test file (client)
cd apps/client && npx vitest run path/to/test.ts

# Prisma migrations
cd apps/server && npx prisma migrate dev
cd apps/server && npx prisma generate
```

## Architecture

### Monorepo structure

- `apps/client` — React + Vite + TypeScript frontend
- `apps/server` — Node.js + Express + TypeScript backend
- `packages/shared-types` — Shared TypeScript types used by both client and server
- `packages/config-typescript`, `config-eslint`, `jest-presets` — Shared tooling configs

Build orchestration is handled by **Turbo** (`turbo.json`). The global env vars (JWT secrets, database URLs, OAuth keys) must be set for Turbo tasks to run correctly.

### Backend (`apps/server`)

Layered architecture: **Routes → Handlers → Services → Repositories → Prisma**

- `src/routes/` — Express route definitions (`api.ts`, `auth.ts`)
- `src/handlers/` — Thin route handlers; validate input, call services, return responses
- `src/services/` — Business logic
- `src/repositories/` — Data access abstraction over Prisma
- `src/schemas/` — Zod schemas for request validation
- `src/middleware/` — Auth, error handling, rate limiting, HTTP logging (Pino)
- `src/config/` — App config and Prisma client instance
- `prisma/schema.prisma` — PostgreSQL schema (User, Competition, Match, Team, Player, Vote, RefreshToken, etc.)

Key domain concepts: multi-dashboard, competition seasons (LEAGUE / DUEL / KNOCKOUT), match types (5/6/7/11-a-side), voting/rating system, player invitations with email.

Authentication uses JWT access + refresh tokens (rotation), cookie-based storage, and Google OAuth. Expired match cleanup runs as a scheduled cron via `node-cron`.

### Frontend (`apps/client`)

Feature-based structure with React Router for routing, React Query for server state, React Context for global auth/competition state.

- `src/app.tsx` — Root router; public vs. protected routes (wrapped by `<ProtectedRoute>`)
- `src/pages/` — Route-level page components
- `src/features/` — Domain-scoped feature modules (forms, lists, views)
- `src/components/` — Shared UI (built on Shadcn UI + Tailwind)
- `src/context/` — `AuthContext`, `CompetitionContext`
- `src/hooks/` — Custom hooks for business logic
- `src/config/` — Axios instance with refresh-token interceptor

UI components are from **Shadcn UI** (see `components.json`). Drag-and-drop uses `@dnd-kit`. Charts use `chart.js` + `react-chartjs-2`. Forms use React Hook Form + Zod.

Vite is configured with manual chunk splitting (`vendor`, `ui`, `data`, `utils`, `interaction`) and a 600 KB bundle size warning threshold. The `@` alias resolves to `src/`.

### Shared types

`packages/shared-types` exports TypeScript interfaces and types used across client and server. Import as `@repo/shared-types`. Always update this package when adding or changing API contracts.

### Docker / deployment

The `Dockerfile` does a multi-stage build (deps → builder → runner) on Node 22 Alpine, builds shared-types + client + server in order, runs Prisma migrations on startup, and serves everything on port 5000. In production the Express server serves the built client as static files.
