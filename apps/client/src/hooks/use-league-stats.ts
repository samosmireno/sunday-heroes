import axios from "axios";
import { config } from "../config/config";
import { useQuery } from "@tanstack/react-query";
import { LeaguePlayerTotals } from "@repo/shared-types";
import { useMemo } from "react";

const fetchLeagueStats = async (
  competitionId: string,
): Promise<LeaguePlayerTotals[]> => {
  const { data } = await axios.get(
    `${config.server}/api/leagues/${competitionId}/stats`,
  );
  return data;
};

export const useLeagueStats = (competitionId: string) => {
  const leagueStatsQuery = useQuery({
    queryKey: ["leagueStats", competitionId],
    queryFn: () => fetchLeagueStats(competitionId),
    enabled: !!competitionId,
  });

  const topPerformers = useMemo(() => {
    const players = leagueStatsQuery.data;

    if (!players || players.length === 0) {
      return { topScorer: null, topAssister: null, topRated: null };
    }

    const topScorer = players.reduce((prev, current) =>
      (current.goals || 0) > (prev.goals || 0) ? current : prev,
    );

    const topAssister = players.reduce((prev, current) =>
      (current.assists || 0) > (prev.assists || 0) ? current : prev,
    );

    const topRated = players.reduce((prev, current) =>
      (current.rating || 0) > (prev.rating || 0) ? current : prev,
    );

    return { topScorer, topAssister, topRated };
  }, [leagueStatsQuery.data]);

  return {
    players: leagueStatsQuery.data,
    ...topPerformers,
    isLoading: leagueStatsQuery.isLoading,
    refetch: leagueStatsQuery.refetch,
    error: leagueStatsQuery.error,
  };
};
