/*
  Warnings:

  - You are about to drop the column `competition_id` on the `CompetitionInvitation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CompetitionInvitation" DROP CONSTRAINT "CompetitionInvitation_competition_id_fkey";

-- DropIndex
DROP INDEX "CompetitionInvitation_competition_id_idx";

-- AlterTable
ALTER TABLE "CompetitionInvitation" DROP COLUMN "competition_id";
