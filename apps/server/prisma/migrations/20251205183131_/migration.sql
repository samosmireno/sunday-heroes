-- DropIndex
DROP INDEX "public"."MatchPlayer_matchId_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;

-- CreateIndex
CREATE INDEX "Competition_name_idx" ON "Competition"("name");

-- CreateIndex
CREATE INDEX "MatchPlayer_dashboardPlayerId_matchId_idx" ON "MatchPlayer"("dashboardPlayerId", "matchId");

-- CreateIndex
CREATE INDEX "PlayerVote_matchId_voterId_idx" ON "PlayerVote"("matchId", "voterId");
