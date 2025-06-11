-- DropForeignKey
ALTER TABLE "PlayerVote" DROP CONSTRAINT "PlayerVote_match_player_id_fkey";

-- AddForeignKey
ALTER TABLE "PlayerVote" ADD CONSTRAINT "PlayerVote_match_player_id_fkey" FOREIGN KEY ("match_player_id") REFERENCES "MatchPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
