// Global setup for the db project: applies the real migrations to the test database
// once per run. Migrations rather than `db push`, so custom SQL such as partial
// unique indexes exists in the test database exactly as in production.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { COMPOSE_HINT, loadTestEnv } from "./test-env";

const serverDir = path.resolve(__dirname, "../..");

export default function globalSetup(): void {
  const url = loadTestEnv();

  try {
    execFileSync("npx", ["prisma", "migrate", "deploy"], {
      cwd: serverDir,
      env: { ...process.env, DATABASE_URL: url },
      stdio: "pipe",
      shell: process.platform === "win32",
    });
  } catch (error) {
    const output = [
      (error as { stdout?: Buffer }).stdout?.toString(),
      (error as { stderr?: Buffer }).stderr?.toString(),
    ]
      .filter(Boolean)
      .join("\n");

    throw new Error(
      `prisma migrate deploy failed against the test database.\n${COMPOSE_HINT}\n\n${output}`,
    );
  }
}
