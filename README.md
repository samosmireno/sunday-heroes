# Sunday Heroes

A full-stack web application for managing football teams, matches, and player statistics with analytics and team management features.

## Features

- **Team Management** - Create and manage football teams
- **Match Tracking** - Record match results
- **Competition System** - Support for leagues, knockouts, and duel formats
- **Player Invitations** - Invite players via email with secure token-based system
- **Admin Dashboard** - Advanced analytics and team performance insights
- **Responsive Design** - Modern UI optimized for desktop and mobile devices

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite**
- **Tailwind CSS**
- **Shadcn UI**
- **React Hook Form** + **Zod**
- **React Router**
- **Axios**

### Backend

- **Node.js** + **Express**
- **TypeScript**
- **Prisma**
- **JWT**

## Tests

```bash
docker compose up -d   # disposable Postgres 16 on localhost:5433; the only setup step
npm test               # server (Vitest: unit + db projects) and client (Vitest) through Turbo
```

The server's `db` tests apply the real migrations to the compose database and truncate every table before each test; the harness refuses any database host other than localhost. CI (`.github/workflows/ci.yml`) runs lint, type checks and tests on every push to `main` and every pull request.
