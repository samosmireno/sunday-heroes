/*
  Warnings:

  - You are about to drop the column `currentSeason` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `trackSeasons` on the `Competition` table. All the data in the column will be lost.
  - Added the required column `seasonId` to the `Match` table without a default value. This is not possible if the table is not empty.

  Hand-edited (ADR 0001): the generated file is reordered so that Season exists
  before Match.seasonId is added, and the required column is added nullable,
  backfilled, then constrained. Every DML statement touches zero rows on empty
  tables, because this file is replayed against the shadow database on every
  `migrate dev`. The partial unique index at the end is invisible to the Prisma 6
  engine; a Prisma 7.4+ upgrade must redeclare it in the schema.
*/
-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Season_competitionId_idx" ON "Season"("competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_competitionId_number_key" ON "Season"("competitionId", "number");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill (hand-written): one open Season 1 per existing Competition, started
-- when the Competition was created. Prisma's @default(uuid()) is not a database
-- default, so ids are minted here (gen_random_uuid() is built in from PostgreSQL 13).
-- The stored Competition.currentSeason is ignored.
INSERT INTO "Season" ("id", "competitionId", "number", "startedAt", "endedAt")
SELECT gen_random_uuid()::text, c."id", 1, c."createdAt", NULL
FROM "Competition" c;

-- AlterTable (edited: generated as NOT NULL; added nullable, backfilled, then constrained)
ALTER TABLE "Match" ADD COLUMN     "seasonId" TEXT;

-- Backfill (hand-written): every existing Match belongs to its Competition's Season 1.
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

-- One open Season per Competition (hand-written partial unique index; the Prisma
-- schema cannot declare it).
CREATE UNIQUE INDEX "Season_one_open_per_competition_key" ON "Season"("competitionId") WHERE "endedAt" IS NULL;

-- AlterTable
ALTER TABLE "Competition" DROP COLUMN "currentSeason",
DROP COLUMN "trackSeasons";
