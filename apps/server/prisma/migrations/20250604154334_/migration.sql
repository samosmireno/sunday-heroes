-- DropForeignKey
ALTER TABLE "Competition" DROP CONSTRAINT "Competition_dashboard_id_fkey";

-- DropForeignKey
ALTER TABLE "CompetitionModerator" DROP CONSTRAINT "CompetitionModerator_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "CompetitionModerator" DROP CONSTRAINT "CompetitionModerator_dashboard_player_id_fkey";

-- DropForeignKey
ALTER TABLE "DashboardPlayer" DROP CONSTRAINT "DashboardPlayer_dashboard_id_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamCompetition" DROP CONSTRAINT "TeamCompetition_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamCompetition" DROP CONSTRAINT "TeamCompetition_team_id_fkey";

-- AddForeignKey
ALTER TABLE "DashboardPlayer" ADD CONSTRAINT "DashboardPlayer_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "Dashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "Dashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionModerator" ADD CONSTRAINT "CompetitionModerator_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionModerator" ADD CONSTRAINT "CompetitionModerator_dashboard_player_id_fkey" FOREIGN KEY ("dashboard_player_id") REFERENCES "DashboardPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamCompetition" ADD CONSTRAINT "TeamCompetition_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamCompetition" ADD CONSTRAINT "TeamCompetition_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
