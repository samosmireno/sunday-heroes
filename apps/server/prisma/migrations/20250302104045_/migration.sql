-- DropForeignKey
ALTER TABLE "MatchPlayer" DROP CONSTRAINT "MatchPlayer_match_id_fkey";

-- DropForeignKey
ALTER TABLE "MatchPlayer" DROP CONSTRAINT "MatchPlayer_player_id_fkey";

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
