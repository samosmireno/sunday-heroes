import path from "node:path";
import dotenv from "dotenv";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

export const COMPOSE_HINT =
  "Start the test database with `docker compose up -d` from the repo root; it publishes Postgres on localhost:5433.";

/**
 * Returns the URL if it points at a local Postgres, otherwise throws.
 * This is the guard that keeps the test setup away from the production database.
 */
export function assertLocalDatabaseUrl(url: string | undefined): string {
  if (!url) {
    throw new Error(`TEST_DATABASE_URL is not set. ${COMPOSE_HINT}`);
  }

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    throw new Error(`TEST_DATABASE_URL is not a valid URL. ${COMPOSE_HINT}`);
  }

  if (!LOCAL_HOSTS.has(hostname)) {
    throw new Error(
      `Refusing to run tests against "${hostname}": TEST_DATABASE_URL must point at localhost or 127.0.0.1. ${COMPOSE_HINT}`,
    );
  }

  return url;
}

/**
 * Loads the committed .env.test (never overriding a variable that is already set,
 * so CI can supply its own TEST_DATABASE_URL) and points DATABASE_URL at the test
 * database. It never reads DATABASE_URL, which holds the production URL in a
 * developer's .env. Must run before any import of the Prisma client module.
 */
export function loadTestEnv(): string {
  // Vitest only defaults NODE_ENV; a shell that exports it would otherwise win.
  process.env.NODE_ENV = "test";
  dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

  const url = assertLocalDatabaseUrl(process.env.TEST_DATABASE_URL);
  process.env.DATABASE_URL = url;
  return url;
}
