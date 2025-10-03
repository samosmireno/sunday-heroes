import { MatchFormData, MatchSchema } from "./types";

interface PlayerStats {
  goals: number;
  assists: number;
}

const calculateTeamStats = (
  playerStats: Array<{ goals: number; assists: number }>,
  startIndex: number,
  endIndex: number,
): PlayerStats => {
  return playerStats.slice(startIndex, endIndex).reduce(
    (acc, player) => ({
      goals: acc.goals + (player.goals || 0),
      assists: acc.assists + (player.assists || 0),
    }),
    { goals: 0, assists: 0 },
  );
};

const validateTeamStats = (
  teamStats: PlayerStats,
  teamScore: number | undefined,
): boolean => {
  const score = teamScore || 0;
  return teamStats.goals <= score && teamStats.assists <= score;
};

export const createTeamStatsValidation = (schema: MatchSchema) => {
  return schema.refine(
    (data: MatchFormData) => {
      const { match, matchPlayers, players } = data;
      const playerStats = matchPlayers?.players || [];
      const homePlayersCount = players?.homePlayers?.length || 0;

      const homeStats = calculateTeamStats(playerStats, 0, homePlayersCount);
      const awayStats = calculateTeamStats(
        playerStats,
        homePlayersCount,
        playerStats.length,
      );

      const isHomeStatsValid = validateTeamStats(
        homeStats,
        match.homeTeamScore,
      );
      const isAwayStatsValid = validateTeamStats(
        awayStats,
        match.awayTeamScore,
      );

      return isHomeStatsValid && isAwayStatsValid;
    },
    {
      message: "Player stats cannot exceed team totals",
      path: ["matchPlayers"],
    },
  );
};
