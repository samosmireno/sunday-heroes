# Prisma migration path for stamping existing matches with a season

Research for GitHub issue #6 ("Migration path for stamping existing matches with a season").
Question: what is Prisma's documented, safe migration path on PostgreSQL for the two storage
candidates, so the data-model decision can weigh migration cost honestly?

Pinned versions: `prisma` / `@prisma/client` **6.19.3** as installed in `apps/server`
(`package.json` declares `^6.2.1`), schema engine commit `c2990dca591cba766e3b7ef5d9e8a84796e47ab7`
(from `npx prisma --version`), provider `postgresql` (`migration_lock.toml`). The PostgreSQL
server version is not pinned anywhere in the repo (no compose file, no infra config), so the one
version-sensitive claim below (`gen_random_uuid()`) is flagged.

> Docs-version note. The unversioned `prisma.io/docs/orm/...` pages now describe **Prisma 8**, whose
> migration system (`migration.ts` compiled to `ops.json`, applied by `prisma db migrate`) is not what
> this project runs. Every Prisma doc cited here is the **v6** page under `prisma.io/docs/v6/...`
> (or the matching file on the `v6` branch of `prisma/docs`), which is what Prisma 6.19.3 implements.

## Summary

1. **Candidate A** (`Match.season Int @default(1)`) is a one-statement migration with no custom SQL: Prisma generates `ALTER TABLE "Match" ADD COLUMN "season" INTEGER NOT NULL DEFAULT 1;`, which PostgreSQL applies as a catalog-only change with no table rewrite, and this repo already shipped the identical shape for `Competition.currentSeason` in `20250715075033_`.
2. **Candidate B** (`Season` table + required `Match.seasonId` FK) needs a hand-edited migration: `prisma migrate dev --create-only`, then insert one `Season` per `Competition`, add `seasonId` **nullable**, `UPDATE` every match, `SET NOT NULL`, then add the FK — the exact add-nullable → backfill → `SET NOT NULL` shape Prisma's own "Customizing migrations" example uses.
3. B fits in **one** migration file because the backfill is pure SQL (`INSERT ... SELECT`, `UPDATE ... FROM`); Prisma's expand-and-contract guide only needs two migrations because its backfill runs through Prisma Client between them, or when app code must ship between expand and contract for zero downtime — neither applies here.
4. Both candidates deploy identically: `prisma migrate deploy` applies pending `migration.sql` files in timestamp order with no shadow database; on PostgreSQL the engine sends each file as a single simple-query message, so a failing migration rolls back its DDL and DML but still leaves a failed row in `_prisma_migrations` that must be cleared with `prisma migrate resolve --rolled-back`.
5. B's real risks are small but specific: `@default(uuid())` is Prisma-level so the SQL must mint ids itself (`gen_random_uuid()`, built in since PostgreSQL 13); the custom SQL is replayed against an *empty* shadow database on every `migrate dev`, so it must be a no-op on empty tables; and `SET NOT NULL` plus the FK each scan `Match` under a lock — trivial at this project's scale.

## Common ground: how Prisma 6 applies a customized migration on PostgreSQL

### The documented step sequence

Prisma's v6 "Customizing migrations" page gives the procedure verbatim [S1]:

> 1. Make a schema change that requires custom SQL (for example, to preserve existing data)
> 2. Create a draft migration using: `npx prisma migrate dev --create-only`
> 3. Modify the generated SQL file.
> 4. Apply the modified SQL by running: `npx prisma migrate dev`

The CLI reference describes `--create-only` as "Creates a new migration but does not apply it. This
also works if you haven't made any changes to your schema (in that case, an empty migration is
created). Run `migrate dev` to apply migration." and adds: "If a schema drift is detected while
running `prisma migrate dev` using `--create-only`, you will be prompted to reset your database." [S4]

What `migrate dev` does on that second run (CLI reference, verbatim) [S4]:

> 1. Reruns the existing migration history in the shadow database in order to detect schema drift
>    (edited or deleted migration file, or a manual changes to the database schema)
> 2. Applies pending migrations to the shadow database (for example, new migrations created by colleagues)
> 3. Generates a new migration from any changes you made to the Prisma schema before running `migrate dev`
> 4. Applies all unapplied migrations to the development database and updates the `_prisma_migrations` table
> 5. Triggers the generation of artifacts (for example, Prisma Client)

The edited file is applied *as written*; Prisma does not re-derive it. What Prisma does check is
that the schema and the migration history agree afterwards: to generate a migration it "Calculates
the target database schema as a function of the current Prisma schema", "Compares the end state of
the existing migration history and the target schema, and generates steps to get from one to the
other" [S2]. Consequence for both candidates: **the hand-edited migration must end in exactly the
state `schema.prisma` declares** (same nullability, same default, same FK/index names), otherwise
the next `migrate dev` will generate a corrective migration.

### What the shadow database does with custom SQL

The shadow database "is a second, *temporary* database that is **created and deleted
automatically** each time you run `prisma migrate dev`" and "is **not** required in production, and
is not used by production-focused commands such as `prisma migrate resolve` and
`prisma migrate deploy`" [S2]. To detect drift it "Reruns the **current**, existing migration history
in the shadow database" [S2]. The engine does this literally: for every migration directory it reads
`migration.sql` and executes it with `raw_cmd(&script)` against the shadow connection
(`sql_schema_from_migrations_and_db` in `flavour/postgres.rs`) [S14]. There is no filtering of
DML, so **any `INSERT`/`UPDATE` you put in a migration runs in the shadow database on every future
`migrate dev`, against tables that are empty**. The SQL therefore has to be valid and harmless on an
empty database (an `INSERT ... SELECT` from an empty table and an `UPDATE` matching zero rows both
qualify; `SET NOT NULL` on an empty table succeeds).

On PostgreSQL the shadow database requires that "The user must be a super user or have `CREATEDB`
privilege", or a manually provisioned `shadowDatabaseUrl` [S2]. This only affects developer
machines, never production.

### How `prisma migrate deploy` applies it in production

The CLI reference [S4] and the "Development and production" page [S3] agree: "The `migrate deploy`
command applies all pending migrations, and creates the database if it does not exist. Primarily used
in non-development environments. This command: Does **not** look for drift in the database or changes
in the Prisma schema; Does **not** reset the database or generate artifacts; Does **not** rely on a
shadow database." It "should generally be part of an automated CI/CD pipeline, and we do not recommend
running this command locally to deploy changes to a production database" [S3].

Mechanically (engine `apply_migrations.rs` at the pinned commit) [S12]:

1. `connector.acquire_lock()` — on PostgreSQL this is `SELECT pg_advisory_lock(72707369)` [S14];
   the docs describe the lock as having "a 10 second timeout (not configurable)" [S3].
2. `detect_failed_migrations` — any `_prisma_migrations` row with `finished_at IS NULL AND
   rolled_back_at IS NULL` aborts the run before anything is applied.
3. Unapplied = filesystem migrations whose `migration_name` has no non-rolled-back DB row.
4. For each, in order: `record_migration_started(name, script)` (writes the row with the script's
   checksum), then `apply_script`, then `record_successful_step` + `record_migration_finished`; on
   error, `record_failed_step(id, logs)` and stop.

**Ordering.** The CLI, not the engine, decides the order: `listMigrations.ts` reads the directory
entries and sorts them "lexicographically by name" with `localeCompare` [S10]; the engine iterates
that list [S12]. The `{timestamp}_{name}` prefix is therefore the ordering key [S5]. A single new
`2026..._add_season` directory sorts after everything that exists today.

**Checksums.** `_prisma_migrations` stores `checksum VARCHAR(64)` per migration [S14]. Editing an
applied file makes `migrate dev` error "because a migration has been changed and suggests resetting
the database", while `migrate deploy` will "warn you that migration histories do not match" and keep
warning [S5]. So: edit the file *before* it is applied anywhere that matters, and never after it has
reached production.

### Atomicity on PostgreSQL (what happens if the custom SQL fails)

This is not stated on any docs page; it follows from the engine source plus the PostgreSQL protocol:

- The Postgres connector's `apply_migration_script` executes the whole file with one
  `client.simple_query(script)` call [S13]. The Postgres SQL renderer does not inject
  `BEGIN`/`COMMIT` (the `render_begin_transaction` default is `None` and the Postgres renderer does
  not override it; MSSQL does) [S16] — consistent with none of this repo's 30 migration files
  containing `BEGIN`/`COMMIT`.
- PostgreSQL's protocol rule: "When a simple Query message contains more than one SQL statement
  (separated by semicolons), those statements are executed as a single transaction, unless explicit
  transaction control commands are included to force a different behavior." and "execution of the
  message is abandoned at the first error" [S18].

So on PostgreSQL a migration file is all-or-nothing: if the `SET NOT NULL` or the FK step fails, the
`CREATE TABLE`, `INSERT`s and `UPDATE`s in the same file roll back too. **But** the bookkeeping row
was written by a separate `record_migration_started` call before the script ran, and
`record_failed_step` fills its `logs` afterwards [S12]. The next `migrate deploy` then refuses to run
until the failed migration is resolved: "mark the migration as rolled back using
`prisma migrate resolve --rolled-back "migration_name"`, optionally modify the migration to address
the issue, then re-deploy with `prisma migrate deploy`" [S6]. The same page lists "add a mandatory
(`NOT NULL`) column to a table that already has data" as a canonical cause of a failed production
migration [S6]. Do not add your own `BEGIN;`/`COMMIT;` to a migration: it would split the implicit
transaction and make the file partially applicable [S18].

### What Prisma warns about a required column with no default

The check lives in the engine's `unexecutable_step_check.rs` [S15]. For `AddedRequiredFieldToTable`
the message is "Added the required column `{column}` to the `{table}` table without a default value."
followed by "There are {row_count} rows in this table, it is not possible to execute this step." when
the dev database was inspected and has rows, or "This is not possible if the table is not empty." when
the row count is unknown; a zero-row table produces no warning at all. A sibling variant fires when
the "default" is Prisma-level: "The required column `{column}` was added to the `{table}` table with
a prisma-level default value. ... Please add this column as optional, then populate it before making
it required." [S15].

The CLI's behaviour on an unexecutable step [S11]: **without** `--create-only`, `migrate dev` aborts
with "We found changes that cannot be executed" and tells you to "use `prisma migrate dev
--create-only` to create the migration file, and manually modify it to address the underlying
issue(s). Then run `prisma migrate dev` to apply it and verify it works." **With** `--create-only`
it prints the same text to stderr and still writes the file. The engine's `render_script` then writes
every warning and unexecutable step into a `/* Warnings: ... */` header at the top of `migration.sql`
[S16] — which is exactly the header on ten of this repo's existing migrations, e.g.
`20250715085155_/migration.sql`:

```sql
/*
  Warnings:

  - Made the column `givenName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "givenName" SET NOT NULL;
```

Note that `prisma migrate diff --script` (used below to produce the exact SQL) does **not** emit this
header; only `migrate dev` does, because only it runs the destructive-change checker.

### Can one migration file express "add nullable → backfill → SET NOT NULL"?

Yes, and it is Prisma's own worked example. The "Change the direction of a 1-1 relation" example
edits the generated `ALTER TABLE "User" ADD COLUMN "profileId" INTEGER NOT NULL;` into [S1]:

```sql
ALTER TABLE "User" ADD COLUMN "profileId" INTEGER;

UPDATE "User"
SET "profileId" = "Profile".id
FROM "Profile"
WHERE "User".id = "Profile"."userId";

ALTER TABLE "User" ALTER COLUMN "profileId" SET NOT NULL;
```

all inside the one `migration.sql`, applied with a single `npx prisma migrate dev` [S1]. The
expand-and-contract *guide* uses two migrations, but only because its backfill is a TypeScript
script using Prisma Client (`prisma.$transaction(...)`, `tx.post.update(...)`) that must run between
"2.2 Create migration" and "4.3 Generate cleanup migration" [S8]; the customizing page's own
expand-and-contract example likewise splits steps because application code is deployed between them
("*Expand*: update the application code and write to both ... and deploy the code") [S1]. When the
backfill is expressible in SQL and no intermediate app deploy is needed, one file is the documented
path.

## Candidate A — `Match.season Int` backfilled with 1

### Schema change

```prisma
model Match {
  ...
  season           Int          @default(1)
}
```

### Generated SQL (verbatim output of `prisma migrate diff --from-schema-datamodel <current> --to-schema-datamodel <new> --script`, Prisma 6.19.3)

```sql
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "season" INTEGER NOT NULL DEFAULT 1;
```

This is already applied with plain `npx prisma migrate dev --name add_match_season`; no
`--create-only`, no editing. Every existing row reads `1` because PostgreSQL stores a non-volatile
`DEFAULT` in the catalog: "When a column is added with `ADD COLUMN` and a non-volatile `DEFAULT` is
specified, the default value is evaluated at the time of the statement and the result stored in the
table's metadata, where it will be returned when any existing rows are accessed. ... making the
`ALTER TABLE` very fast even on large tables. ... In neither case is a rewrite of the table
required." [S17]. Prisma emits no warning, because the column has a database-level default.

Repo precedent: `20250715075033_/migration.sql` added `"currentSeason" INTEGER NOT NULL DEFAULT 1`
and `"trackSeasons" BOOLEAN NOT NULL DEFAULT false` to a populated `Competition` table the same way;
`20250624093751_` and `20251212112818_is_motm` did it for booleans on `Match`/`MatchPlayer`.

### Variant: no permanent `@default(1)` in the schema

If the model should read `season Int` with no default, Prisma generates
`ALTER TABLE "Match" ADD COLUMN "season" INTEGER NOT NULL;` (verified with `migrate diff`) plus the
"Added the required column `season` to the `Match` table without a default value" warning, and
`migrate dev` refuses to apply it to a populated dev database [S11][S15]. The fix is the documented
`--create-only` edit:

```sql
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "season" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Match" ALTER COLUMN "season" DROP DEFAULT;
```

The end state (NOT NULL, no default) then matches the schema, so the next `migrate dev` generates
nothing further [S2]. Either variant is one file and one statement or two.

### Pitfalls

- `@default(1)` is a **static** default and therefore database-level; do not reach for
  `@default(dbgenerated(...))` or a Prisma-level function here. (Contrast with candidate B's ids.)
- Backfilling with the literal `1` assumes every existing match belongs to season 1.
  `Competition.currentSeason` is user-supplied at creation (`z.coerce.number().min(1).optional()`,
  defaulted to 1 in `competition-transforms.ts`) and nothing in `apps/server/src` ever increments it,
  so a competition created with `currentSeason: 3` exists only if a user typed it. If that matters,
  the `--create-only` variant can instead run
  `UPDATE "Match" m SET "season" = c."currentSeason" FROM "Competition" c WHERE c."id" = m."competitionId";`
  after the `ADD COLUMN`.
- Nothing else: no shadow-database interaction beyond replaying a single `ALTER TABLE`, no
  ordering constraints, no FK.

## Candidate B — `Season` table + required `Match.seasonId`

### Schema change (the model used to generate the SQL below)

```prisma
model Competition {
  ...
  seasons       Season[]
}

model Match {
  ...
  seasonId         String
  season         Season       @relation(fields: [seasonId], references: [id], onDelete: Cascade)
  @@index([seasonId])
}

model Season {
  id            String    @id @default(uuid())
  competitionId String
  number        Int
  startedAt     DateTime  @default(now())
  endedAt       DateTime?
  createdAt     DateTime  @default(now())

  competition Competition @relation(fields: [competitionId], references: [id], onDelete: Cascade)
  matches     Match[]

  @@unique([competitionId, number])
  @@index([competitionId])
}
```

### What Prisma generates (verbatim `migrate diff --script` output, Prisma 6.19.3)

```sql
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "seasonId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Season_competitionId_idx" ON "Season"("competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_competitionId_number_key" ON "Season"("competitionId", "number");

-- CreateIndex
CREATE INDEX "Match_seasonId_idx" ON "Match"("seasonId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

Applied as-is to a populated `Match` table, the first statement fails (PostgreSQL cannot add a
`NOT NULL` column with no default to a non-empty table), which is why `migrate dev` without
`--create-only` refuses to create it and `--create-only` stamps the file with
"Added the required column `seasonId` to the `Match` table without a default value ..." [S11][S15].
Note two things about the generated order: `Season` has **no** database-level default for `"id"`
(see pitfalls), and the FKs are appended last, so any hand-written DML placed between the DDL
statements runs before the constraints exist.

### Steps

1. Edit `schema.prisma` as above.
2. `npx prisma migrate dev --create-only --name add_season` — writes
   `prisma/migrations/<timestamp>_add_season/migration.sql` with the SQL above and the warning
   header, applies nothing [S1][S4].
3. Edit the file to the version below.
4. `npx prisma migrate dev` — replays history plus this file in the shadow database, applies it to
   the dev database, regenerates Prisma Client [S4]. Because the end state matches the schema, no
   extra migration is generated [S2].
5. Commit the whole `prisma/migrations` folder [S5]; CI runs `npx prisma migrate deploy` [S3].

### Sketched single-file migration for this schema

```sql
/*
  Warnings:

  - Added the required column `seasonId` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Season_competitionId_idx" ON "Season"("competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_competitionId_number_key" ON "Season"("competitionId", "number");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration (hand-written): one season per existing competition.
-- Prisma's @default(uuid()) is not a database default, so ids are minted here.
INSERT INTO "Season" ("id", "competitionId", "number", "startedAt")
SELECT gen_random_uuid()::text, c."id", 1, c."createdAt"
FROM "Competition" c;

-- AlterTable (edited: generated as NOT NULL; added nullable, backfilled, then constrained)
ALTER TABLE "Match" ADD COLUMN     "seasonId" TEXT;

UPDATE "Match" m
SET "seasonId" = s."id"
FROM "Season" s
WHERE s."competitionId" = m."competitionId"
  AND s."number" = 1;

ALTER TABLE "Match" ALTER COLUMN "seasonId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Match_seasonId_idx" ON "Match"("seasonId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

Every identifier, constraint name and index name is the one Prisma generated, so the end state is
byte-for-byte what `schema.prisma` implies; only the `Match.seasonId` block is re-ordered and split,
and the `INSERT`/`UPDATE` are new. The whole file executes as one implicit transaction on
PostgreSQL [S13][S18]: a `Match` that somehow ends up without a season makes `SET NOT NULL` fail and
rolls back the table creation and inserts with it.

Verification status: the DDL lines are Prisma's own output; the three hand-written statements were
checked by inspection only. No PostgreSQL was reachable while researching (no local server, Docker
down, and the only `DATABASE_URL` is the hosted Render database, which was deliberately not used), so
before merging, run the file through `npx prisma migrate dev` against a disposable database, or
`npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --shadow-database-url <scratch db>`
which must print an empty diff if the end state matches the schema [S4].

### One migration or two?

One is sufficient and is the documented pattern [S1]. Two migrations become necessary only if:

- the backfill must run through Prisma Client (the expand-and-contract guide's approach, where a
  `data-migration.ts` runs between two `migrate dev` invocations) [S8] — not needed, the mapping
  `Match.competitionId -> Season(competitionId, number = 1)` is a two-table join; or
- application code has to be deployed between "expand" (nullable `seasonId`, old code still runs)
  and "contract" (`SET NOT NULL`, new code required), i.e. a zero-downtime rollout [S1]. Sunday
  Heroes deploys DB and app from one image, so the window this protects against does not exist.

If the team wants the two-step shape anyway, the split is: migration 1 = `CREATE TABLE "Season"`,
its indexes/FK, the `INSERT`, `ADD COLUMN "seasonId" TEXT` (nullable, schema says `String?`), the
`UPDATE`, index and FK; deploy; migration 2 = change schema to `String` and let Prisma generate
`ALTER TABLE "Match" ALTER COLUMN "seasonId" SET NOT NULL;` (Prisma stamps it "Made the column
`seasonId` on table `Match` required. This step will fail if there are existing NULL values in that
column." [S15], exactly like `20250715085155_`).

### Pitfalls

- **`@default(uuid())` produces no SQL default.** The schema reference says of `uuid()`:
  "Implemented by Prisma ORM and therefore not "visible" in the underlying database schema" — values
  are generated by the query engine at insert time [S7]. The generated `CREATE TABLE "Season"` above
  confirms it: `"id" TEXT NOT NULL` with no `DEFAULT`. A migration-time `INSERT` must therefore
  supply ids. `gen_random_uuid()` "returns a version 4 (random) UUID" and is built into PostgreSQL
  from 13 [S19]; Prisma's own note: "To use it in PostgreSQL versions 12.13 and earlier, you must
  enable the `pgcrypto` extension" [S7]. Because `Season.id` is `TEXT`, cast with `::text`. The
  production PostgreSQL version is not recorded in this repo (the server `.env` points at a
  Render-hosted database); confirm it is >= 13 with `SELECT version();` before relying on this (the
  fallback is enabling `pgcrypto`, which Prisma can declare via the `postgresqlExtensions` preview
  feature [S7]).
  Do **not** try to sidestep this with `seasonId String @default(uuid())` on `Match`: the engine
  recognises Prisma-level defaults and reports "The required column `seasonId` was added to the
  `Match` table with a prisma-level default value ... Please add this column as optional, then
  populate it before making it required." [S15].
- **`now()` is fine.** Unlike `uuid()`, `now()` is "Implemented on the database-level" and maps to
  `CURRENT_TIMESTAMP` on PostgreSQL [S7], which is why `"startedAt"`/`"createdAt"` carry SQL
  defaults and the `INSERT` only needs to override `"startedAt"` with `c."createdAt"`.
- **Shadow-database replay.** Every future `migrate dev` re-executes this file against an empty
  shadow database [S2][S14]. The `INSERT ... SELECT` and `UPDATE` then touch zero rows and
  `SET NOT NULL` succeeds on the empty `Match` table, so the file is replay-safe as written. Keep it
  that way: no `RAISE` on zero rows, no hard-coded competition ids, no reliance on data.
- **Statement order inside the file.** `Season` must exist before the `INSERT`; the `INSERT` must
  precede the `UPDATE`; the `UPDATE` must precede `SET NOT NULL`; `SET NOT NULL` and the `INSERT`
  must precede `Match_seasonId_fkey` (an FK added before the backfill would still pass — NULLs
  satisfy FKs — but the generated file's "Match first, Season second" order would put the
  `ADD COLUMN` before `CREATE TABLE "Season"`, so re-order rather than interleave).
- **Table scans and locks.** "`SET NOT NULL` may only be applied to a column provided none of the
  records in the table contain a `NULL` value for the column. Ordinarily this is checked during the
  `ALTER TABLE` by scanning the entire table" and "Scanning a large table to verify new foreign-key,
  check, or not-null constraints can take a long time, and other updates to the table are locked out
  until the `ALTER TABLE ADD CONSTRAINT` command is committed." [S17]. For a hobby-league `Match`
  table this is milliseconds; it only becomes a design concern at millions of rows, where PostgreSQL's
  `NOT VALID` + `VALIDATE CONSTRAINT` split applies [S17].
- **Failure recovery is a manual step.** If any statement fails in production the file rolls back
  [S13][S18] but `_prisma_migrations` keeps the failed row, so the next `migrate deploy` aborts until
  `prisma migrate resolve --rolled-back "<timestamp>_add_season"` is run [S6][S12]. This is the same
  for candidate A but far less likely to trigger there.
- **Backfill value.** As with A, `number = 1` for every competition is an assumption; the same
  `INSERT` can use `c."currentSeason"` instead of `1` (and the `UPDATE` join `s."number" =
  c."currentSeason"`), which is a one-line difference in the migration but a domain decision.
- **`Competition.currentSeason` / `trackSeasons` become redundant** with a `Season` table; removing
  them is a later, separate `DROP COLUMN` migration (Prisma will warn about data loss), not part of
  this one.

## Sources

Prisma docs (v6 pages, matching the installed 6.19.3):

- [S1] Customizing migrations — https://www.prisma.io/docs/v6/orm/prisma-migrate/workflows/customizing-migrations (source: https://github.com/prisma/docs/blob/v6/content/200-orm/300-prisma-migrate/300-workflows/40-customizing-migrations.mdx)
- [S2] About the shadow database — https://www.prisma.io/docs/v6/orm/prisma-migrate/understanding-prisma-migrate/shadow-database (source: https://github.com/prisma/docs/blob/v6/content/200-orm/300-prisma-migrate/200-understanding-prisma-migrate/200-shadow-database.mdx)
- [S3] Development and production — https://www.prisma.io/docs/v6/orm/prisma-migrate/workflows/development-and-production
- [S4] Prisma CLI reference: `migrate dev`, `migrate deploy`, `migrate diff`, `migrate resolve` — https://www.prisma.io/docs/v6/orm/reference/prisma-cli-reference#migrate-dev (source: https://github.com/prisma/docs/blob/v6/content/200-orm/500-reference/200-prisma-cli-reference.mdx)
- [S5] About migration histories — https://www.prisma.io/docs/v6/orm/prisma-migrate/understanding-prisma-migrate/migration-histories
- [S6] Patching and hotfixing (failed migrations, `migrate resolve`) — https://www.prisma.io/docs/v6/orm/prisma-migrate/workflows/patching-and-hotfixing
- [S7] Prisma schema reference: `@default`, `uuid()`, `now()`, `dbgenerated(...)` — https://www.prisma.io/docs/v6/orm/reference/prisma-schema-reference#uuid (source: https://github.com/prisma/docs/blob/v6/content/200-orm/500-reference/100-prisma-schema-reference.mdx)
- [S8] Expand-and-contract data migration guide — https://www.prisma.io/docs/guides/data-migration (the v6 workflows page `.../workflows/data-migration` is a redirect stub to it; v6 source: https://github.com/prisma/docs/blob/v6/content/800-guides/010-data-migration.mdx)
- [S9] Mental model for Prisma Migrate — https://www.prisma.io/docs/v6/orm/prisma-migrate/understanding-prisma-migrate/mental-model

Prisma source code (pinned to the installed version):

- [S10] prisma/prisma `6.19.3`, `packages/migrate/src/utils/listMigrations.ts` (lexicographic ordering) — https://github.com/prisma/prisma/blob/6.19.3/packages/migrate/src/utils/listMigrations.ts
- [S11] prisma/prisma `6.19.3`, `packages/migrate/src/utils/handleEvaluateDataloss.ts` and `packages/migrate/src/commands/MigrateDev.ts` (unexecutable-step handling, `--create-only`) — https://github.com/prisma/prisma/blob/6.19.3/packages/migrate/src/utils/handleEvaluateDataloss.ts
- [S12] prisma/prisma-engines `c2990dca`, `schema-engine/commands/src/commands/apply_migrations.rs` (deploy loop, failed-migration detection, bookkeeping) — https://github.com/prisma/prisma-engines/blob/c2990dca591cba766e3b7ef5d9e8a84796e47ab7/schema-engine/commands/src/commands/apply_migrations.rs
- [S13] prisma/prisma-engines `c2990dca`, `schema-engine/connectors/sql-schema-connector/src/flavour/postgres/connector/native/mod.rs` (`apply_migration_script` → `simple_query(script)`) — https://github.com/prisma/prisma-engines/blob/c2990dca591cba766e3b7ef5d9e8a84796e47ab7/schema-engine/connectors/sql-schema-connector/src/flavour/postgres/connector/native/mod.rs
- [S14] prisma/prisma-engines `c2990dca`, `schema-engine/connectors/sql-schema-connector/src/flavour/postgres.rs` (advisory lock, `_prisma_migrations` DDL, shadow-database replay loop) — https://github.com/prisma/prisma-engines/blob/c2990dca591cba766e3b7ef5d9e8a84796e47ab7/schema-engine/connectors/sql-schema-connector/src/flavour/postgres.rs
- [S15] prisma/prisma-engines `c2990dca`, `schema-engine/connectors/sql-schema-connector/src/sql_destructive_change_checker/unexecutable_step_check.rs` (warning texts) — https://github.com/prisma/prisma-engines/blob/c2990dca591cba766e3b7ef5d9e8a84796e47ab7/schema-engine/connectors/sql-schema-connector/src/sql_destructive_change_checker/unexecutable_step_check.rs
- [S16] prisma/prisma-engines `c2990dca`, `schema-engine/connectors/sql-schema-connector/src/apply_migration.rs` (`render_script` writes the `Warnings` header) and `src/sql_renderer.rs` (`render_begin_transaction` defaults to `None`) — https://github.com/prisma/prisma-engines/blob/c2990dca591cba766e3b7ef5d9e8a84796e47ab7/schema-engine/connectors/sql-schema-connector/src/apply_migration.rs

PostgreSQL docs:

- [S17] ALTER TABLE, Notes (ADD COLUMN with non-volatile DEFAULT, SET NOT NULL scan, FK scan / NOT VALID) — https://www.postgresql.org/docs/current/sql-altertable.html
- [S18] Frontend/Backend protocol, "Multiple Statements in a Simple Query" — https://www.postgresql.org/docs/current/protocol-flow.html#PROTOCOL-FLOW-MULTI-STATEMENT
- [S19] UUID functions, PostgreSQL 13 (`gen_random_uuid()` in core) — https://www.postgresql.org/docs/13/functions-uuid.html

Local evidence (this repository):

- `apps/server/prisma/schema.prisma` (current models), `apps/server/prisma/migrations/20250715075033_/migration.sql` (`currentSeason INTEGER NOT NULL DEFAULT 1`, `Match_competitionId_fkey` naming), `20250715085155_/migration.sql` and nine others (Prisma `Warnings:` headers), `apps/server/src/utils/competition-transforms.ts` and `src/schemas/create-competition-request-schema.ts` (`currentSeason` handling).
- Generated SQL in this document was produced with the installed CLI: `npx prisma migrate diff --from-schema-datamodel <current schema> --to-schema-datamodel <candidate schema> --script` (Prisma 6.19.3; datamodel-to-datamodel diffing needs no database connection).
