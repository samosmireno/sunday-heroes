import { PlayerListResponse } from "@repo/logger";
import { DashboardPlayerWithDetails } from "../repositories/dashboard-player-repo";
import { calculatePlayerScore } from "./utils";

export function transformDashboardPlayersToResponse(
  players: DashboardPlayerWithDetails[]
): PlayerListResponse[] {
  const playerList: PlayerListResponse[] = players.map((player) => {
    const uniqueCompetitionMap = new Map();
    player.match_players.forEach((mp) => {
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
      totalMatches: player.match_players.length,
      totalGoals: player.match_players.reduce(
        (sum: number, matchPlayer) => sum + (matchPlayer.goals || 0),
        0
      ),
      totalAssists: player.match_players.reduce(
        (sum: number, matchPlayer) => sum + (matchPlayer.assists || 0),
        0
      ),
      averageRating: player.match_players.length
        ? player.match_players.reduce(
            (sum: number, matchPlayer) =>
              sum +
              calculatePlayerScore(
                matchPlayer.received_votes,
                matchPlayer.match.player_votes
              ),
            0
          ) / player.match_players.length
        : null,
      isRegistered: player.user ? player.user.is_registered : false,
      email: player.user?.email,
      competitions: Array.from(uniqueCompetitions).map((comp) => {
        const competition = player.match_players
          .map((mp) => mp.match.competition)
          .find((c) => c.id === comp.id);

        return {
          id: competition?.id || "",
          name: competition?.name || "",
          matches: player.match_players.filter(
            (mp) => mp.match.competition.id === comp.id
          ).length,
          goals: player.match_players
            .filter((mp) => mp.match.competition.id === comp.id)
            .reduce((sum, mp) => sum + (mp.goals || 0), 0),
          assists: player.match_players
            .filter((mp) => mp.match.competition.id === comp.id)
            .reduce((sum, mp) => sum + (mp.assists || 0), 0),
          averageRating:
            player.match_players.length > 0
              ? player.match_players
                  .filter((mp) => mp.match.competition.id === comp.id)
                  .reduce(
                    (sum, mp) =>
                      sum +
                      calculatePlayerScore(
                        mp.received_votes,
                        mp.match.player_votes
                      ),
                    0
                  ) /
                player.match_players.filter(
                  (mp) => mp.match.competition.id === comp.id
                ).length
              : null,
        };
      }),
    };
  });
  return playerList;
}
