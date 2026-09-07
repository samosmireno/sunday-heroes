/**
 * Reading a one-off repair migration off disk, so the test of a repair pins the
 * SQL that `migrate deploy` will run rather than a copy of it that can drift
 * away from it.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS = join(__dirname, "..", "prisma", "migrations");

/** The migration whose directory name ends in `suffix`, whole. */
export function migrationSql(suffix: string): string {
  const dir = readdirSync(MIGRATIONS).find((name) => name.endsWith(suffix));
  if (!dir) throw new Error(`no ${suffix} migration on disk`);

  return readFileSync(join(MIGRATIONS, dir, "migration.sql"), "utf8");
}

/**
 * Its statements, in file order, with the comments stripped. Prisma sends a
 * migration one statement at a time, which is what makes a repair's row counts
 * separable — and a two-statement repair's counts are the number the rehearsal
 * against a production dump records.
 */
export function migrationStatements(suffix: string): string[] {
  return migrationSql(suffix)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--[^\n]*/g, "")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}
