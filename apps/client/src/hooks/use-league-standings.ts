import axios from "axios";
import { config } from "../config/config";
import { useQuery } from "@tanstack/react-query";
import { LeagueTeamResponse } from "@repo/shared-types";

const fetchLeagueStandings = async (
  competitionId: string,
): Promise<LeagueTeamResponse[]> => {
  const { data } = await axios.get(
    `${config.server}/api/leagues/${competitionId}/standings`,
  );
  return data;
};

export const useLeagueStandings = (competitionId: string) => {
  const leagueStandingsQuery = useQuery({
    queryKey: ["leagueStandings", competitionId],
    queryFn: () => fetchLeagueStandings(competitionId),
    enabled: !!competitionId,
    staleTime: 0,
  });

  return {
    leagueStandings: leagueStandingsQuery.data,
    isLoading: leagueStandingsQuery.isLoading,
    refetch: leagueStandingsQuery.refetch,
    error: leagueStandingsQuery.error,
  };
};
