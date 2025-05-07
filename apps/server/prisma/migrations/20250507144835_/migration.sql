-- DropForeignKey
ALTER TABLE "PlayerVote" DROP CONSTRAINT "PlayerVote_match_id_fkey";

-- AddForeignKey
ALTER TABLE "PlayerVote" ADD CONSTRAINT "PlayerVote_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
