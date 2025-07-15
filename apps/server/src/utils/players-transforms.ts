import { PlayerListResponse } from "@repo/shared-types";
import { DashboardPlayerWithDetails } from "../repositories/dashboard-player-repo";
import { calculatePlayerScore } from "./utils";

export function transformDashboardPlayersToResponse(
  players: DashboardPlayerWithDetails[]
): PlayerListResponse[] {
  const playerList: PlayerListResponse[] = players.map((player) => {
    const uniqueCompetitionMap = new Map();
    player.matchPlayers.forEach((mp) => {
      const competition = mp.match.competition;
      if (!uniqueCompetitionMap.has(competition.id)) {
        uniqueCompetitionMap.set(competition.id, competition);
      }
    });

    const uniqueCompetitions = new Set(uniqueCompetitionMap.values());

    return {
      id: player.id,
      nickname: player.nickname,
      competitionsCount: uniqueCompetitions.size,
      totalMatches: player.matchPlayers.length,
      totalGoals: player.matchPlayers.reduce(
        (sum: number, matchPlayer) => sum + (matchPlayer.goals || 0),
        0
      ),
      totalAssists: player.matchPlayers.reduce(
        (sum: number, matchPlayer) => sum + (matchPlayer.assists || 0),
        0
      ),
      averageRating: player.matchPlayers.length
        ? player.matchPlayers.reduce(
            (sum: number, matchPlayer) =>
              sum +
              calculatePlayerScore(
                matchPlayer.receivedVotes,
                matchPlayer.match.playerVotes
              ),
            0
          ) / player.matchPlayers.length
        : null,
      isRegistered: player.user ? player.user.isRegistered : false,
      email: player.user?.email,
      competitions: Array.from(uniqueCompetitions).map((comp) => {
        const competition = player.matchPlayers
          .map((mp) => mp.match.competition)
          .find((c) => c.id === comp.id);

        return {
          id: competition?.id || "",
          name: competition?.name || "",
          matches: player.matchPlayers.filter(
            (mp) => mp.match.competition.id === comp.id
          ).length,
          goals: player.matchPlayers
            .filter((mp) => mp.match.competition.id === comp.id)
            .reduce((sum, mp) => sum + (mp.goals || 0), 0),
          assists: player.matchPlayers
            .filter((mp) => mp.match.competition.id === comp.id)
            .reduce((sum, mp) => sum + (mp.assists || 0), 0),
          averageRating:
            player.matchPlayers.length > 0
              ? player.matchPlayers
                  .filter((mp) => mp.match.competition.id === comp.id)
                  .reduce(
                    (sum, mp) =>
                      sum +
                      calculatePlayerScore(
                        mp.receivedVotes,
                        mp.match.playerVotes
                      ),
                    0
                  ) /
                player.matchPlayers.filter(
                  (mp) => mp.match.competition.id === comp.id
                ).length
              : null,
        };
      }),
    };
  });
  return playerList;
}
