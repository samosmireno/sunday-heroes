-- DropIndex
DROP INDEX "public"."MatchPlayer_isHome_idx";

-- CreateIndex
CREATE INDEX "MatchPlayer_dashboardPlayerId_isMotm_idx" ON "MatchPlayer"("dashboardPlayerId", "isMotm");

-- CreateIndex
CREATE INDEX "MatchPlayer_dashboardPlayerId_goals_matchId_idx" ON "MatchPlayer"("dashboardPlayerId", "goals", "matchId");

-- CreateIndex
CREATE INDEX "MatchPlayer_dashboardPlayerId_assists_matchId_idx" ON "MatchPlayer"("dashboardPlayerId", "assists", "matchId");

-- CreateIndex
CREATE INDEX "MatchPlayer_dashboardPlayerId_rating_matchId_idx" ON "MatchPlayer"("dashboardPlayerId", "rating", "matchId");
