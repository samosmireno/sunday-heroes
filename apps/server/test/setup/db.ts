// Setup for every db test file: each test starts from an empty database.
import { afterAll, beforeEach } from "vitest";
import prisma from "../../src/repositories/prisma-client";

let tables: string[] | undefined;

async function listPublicTables(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name <> '_prisma_migrations'
  `;
  return rows.map((row) => row.table_name);
}

/** Truncates every table in the public schema except the migrations table. */
export async function truncateAllTables(): Promise<void> {
  tables ??= await listPublicTables();
  if (tables.length === 0) return;

  const tableList = tables.map((table) => `"public"."${table}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} CASCADE`);
}

beforeEach(async () => {
  await truncateAllTables();
});

afterAll(async () => {
  await prisma.$disconnect();
});
