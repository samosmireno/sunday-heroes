-- DropForeignKey
ALTER TABLE "PlayerVote" DROP CONSTRAINT "PlayerVote_voter_id_fkey";

-- AddForeignKey
ALTER TABLE "PlayerVote" ADD CONSTRAINT "PlayerVote_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "DashboardPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
