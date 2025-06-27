/*
  Warnings:

  - You are about to drop the column `is_completed` on the `Match` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MatchPlayer" DROP CONSTRAINT "MatchPlayer_team_id_fkey";

-- AlterTable
ALTER TABLE "Competition" ADD COLUMN     "is_round_robin" BOOLEAN;

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "is_completed",
ALTER COLUMN "date" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TeamRoster" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "dashboard_player_id" TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamRoster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamRoster_team_id_competition_id_idx" ON "TeamRoster"("team_id", "competition_id");

-- CreateIndex
CREATE INDEX "TeamRoster_dashboard_player_id_competition_id_idx" ON "TeamRoster"("dashboard_player_id", "competition_id");

-- CreateIndex
CREATE UNIQUE INDEX "TeamRoster_team_id_dashboard_player_id_competition_id_key" ON "TeamRoster"("team_id", "dashboard_player_id", "competition_id");

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRoster" ADD CONSTRAINT "TeamRoster_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRoster" ADD CONSTRAINT "TeamRoster_dashboard_player_id_fkey" FOREIGN KEY ("dashboard_player_id") REFERENCES "DashboardPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRoster" ADD CONSTRAINT "TeamRoster_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
