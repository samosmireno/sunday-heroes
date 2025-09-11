import { useEffect, useState } from "react";
import { UserTotals } from "./types";
import { MatchResponse } from "@repo/shared-types";

export const usePlayerStats = (matches: MatchResponse[]) => {
  const [playersStats, setPlayersStats] = useState<UserTotals[]>([]);
  useEffect(() => {
    const playerMap = new Map<string, UserTotals>();

    matches.forEach((match) => {
      const allPlayers = match.players;

      allPlayers.forEach((matchPlayer) => {
        if (!playerMap.has(matchPlayer.id)) {
          playerMap.set(matchPlayer.id, {
            id: matchPlayer.id,
            nickname: matchPlayer.nickname,
            totalGoals: matchPlayer.goals || 0,
            totalAssists: matchPlayer.assists || 0,
            totalRating: matchPlayer.rating,
            totalMatches: 1,
          });
        } else {
          const existingPlayer = playerMap.get(matchPlayer.id);

          if (existingPlayer) {
            existingPlayer.totalGoals += matchPlayer.goals || 0;
            existingPlayer.totalAssists += matchPlayer.assists || 0;
            existingPlayer.totalMatches += 1;
            existingPlayer.totalRating = matchPlayer.rating;

            playerMap.set(matchPlayer.id, existingPlayer);
          }
        }
      });
    });

    setPlayersStats(Array.from(playerMap.values()));
  }, [matches]);

  return playersStats;
};
