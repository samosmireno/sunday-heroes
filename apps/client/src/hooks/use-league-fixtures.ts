import axios from "axios";
import { config } from "../config/config";
import { useQuery } from "@tanstack/react-query";
import { LeagueMatchResponse } from "@repo/shared-types";

const fetchLeagueFixtures = async (
  competitionId: string,
): Promise<Record<number, LeagueMatchResponse[]>> => {
  const { data } = await axios.get(
    `${config.server}/api/leagues/${competitionId}/fixtures`,
  );
  return data;
};

export const useLeagueFixtures = (competitionId: string) => {
  const leagueFixturesQuery = useQuery({
    queryKey: ["leagueFixtures", competitionId],
    queryFn: () => fetchLeagueFixtures(competitionId),
    enabled: !!competitionId,
    staleTime: 0,
  });

  return {
    leagueFixtures: leagueFixturesQuery.data || {},
    isFixturesLoading: leagueFixturesQuery.isLoading,
    refetch: leagueFixturesQuery.refetch,
    error: leagueFixturesQuery.error,
  };
};
