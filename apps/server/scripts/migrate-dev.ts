/**
 * `prisma migrate dev` against the compose database, never against DATABASE_URL.
 *
 * The developer `.env` holds the production DATABASE_URL, and `migrate dev`
 * applies migrations (and creates a shadow database) wherever that variable
 * points. This wrapper loads the committed `.env.test` through the test harness,
 * which refuses any host other than localhost, and hands that URL to Prisma.
 *
 * Usage, from apps/server: `npm run migrate:dev -- --create-only --name <name>`
 * Production is touched only by `prisma migrate deploy` at release time.
 */
import { spawnSync } from "node:child_process";
import { loadTestEnv } from "../test/setup/test-env";

const url = loadTestEnv();

const result = spawnSync(
  "npx",
  ["prisma", "migrate", "dev", ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
    shell: process.platform === "win32",
  },
);

process.exit(result.status ?? 1);
