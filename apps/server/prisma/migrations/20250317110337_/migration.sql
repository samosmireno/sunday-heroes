/*
  Warnings:

  - You are about to drop the column `user_id` on the `CompetitionModerator` table. All the data in the column will be lost.
  - You are about to drop the column `player_id` on the `MatchPlayer` table. All the data in the column will be lost.
  - You are about to drop the column `nickname` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[competition_id,dashboard_player_id]` on the table `CompetitionModerator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[match_id,dashboard_player_id]` on the table `MatchPlayer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dashboard_player_id` to the `CompetitionModerator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dashboard_player_id` to the `MatchPlayer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CompetitionModerator" DROP CONSTRAINT "CompetitionModerator_user_id_fkey";

-- DropForeignKey
ALTER TABLE "MatchPlayer" DROP CONSTRAINT "MatchPlayer_player_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerVote" DROP CONSTRAINT "PlayerVote_voter_id_fkey";

-- DropIndex
DROP INDEX "CompetitionModerator_competition_id_user_id_key";

-- DropIndex
DROP INDEX "CompetitionModerator_user_id_idx";

-- DropIndex
DROP INDEX "MatchPlayer_match_id_player_id_key";

-- DropIndex
DROP INDEX "MatchPlayer_player_id_idx";

-- DropIndex
DROP INDEX "User_nickname_idx";

-- DropIndex
DROP INDEX "User_nickname_key";

-- AlterTable
ALTER TABLE "CompetitionModerator" DROP COLUMN "user_id",
ADD COLUMN     "dashboard_player_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MatchPlayer" DROP COLUMN "player_id",
ADD COLUMN     "dashboard_player_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "nickname";

-- CreateTable
CREATE TABLE "DashboardPlayer" (
    "id" TEXT NOT NULL,
    "dashboard_id" TEXT NOT NULL,
    "user_id" TEXT,
    "nickname" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DashboardPlayer_dashboard_id_idx" ON "DashboardPlayer"("dashboard_id");

-- CreateIndex
CREATE INDEX "DashboardPlayer_user_id_idx" ON "DashboardPlayer"("user_id");

-- CreateIndex
CREATE INDEX "DashboardPlayer_dashboard_id_user_id_idx" ON "DashboardPlayer"("dashboard_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardPlayer_dashboard_id_nickname_key" ON "DashboardPlayer"("dashboard_id", "nickname");

-- CreateIndex
CREATE INDEX "CompetitionModerator_dashboard_player_id_idx" ON "CompetitionModerator"("dashboard_player_id");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionModerator_competition_id_dashboard_player_id_key" ON "CompetitionModerator"("competition_id", "dashboard_player_id");

-- CreateIndex
CREATE INDEX "MatchPlayer_dashboard_player_id_idx" ON "MatchPlayer"("dashboard_player_id");

-- CreateIndex
CREATE UNIQUE INDEX "MatchPlayer_match_id_dashboard_player_id_key" ON "MatchPlayer"("match_id", "dashboard_player_id");

-- AddForeignKey
ALTER TABLE "DashboardPlayer" ADD CONSTRAINT "DashboardPlayer_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "Dashboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardPlayer" ADD CONSTRAINT "DashboardPlayer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionModerator" ADD CONSTRAINT "CompetitionModerator_dashboard_player_id_fkey" FOREIGN KEY ("dashboard_player_id") REFERENCES "DashboardPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_dashboard_player_id_fkey" FOREIGN KEY ("dashboard_player_id") REFERENCES "DashboardPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerVote" ADD CONSTRAINT "PlayerVote_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "DashboardPlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
