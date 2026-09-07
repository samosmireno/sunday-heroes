-- AlterTable
ALTER TABLE "Competition" ADD COLUMN     "votingThreshold" INTEGER;

-- CreateIndex
CREATE INDEX "Match_competitionId_isCompleted_idx" ON "Match"("competitionId", "isCompleted");
