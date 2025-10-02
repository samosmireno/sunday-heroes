import axios from "axios";
import { config } from "../../../config/config";
import { useQuery } from "@tanstack/react-query";
import { LeagueMatchResponse } from "@repo/shared-types";
import { useErrorHandler } from "../../../hooks/use-error-handler/use-error-handler";
import { AppError } from "../../../hooks/use-error-handler/types";

export const useLeagueFixtures = (competitionId: string) => {
  const { handleError } = useErrorHandler();

  const fetchLeagueFixtures = async (
    competitionId: string,
  ): Promise<Record<number, LeagueMatchResponse[]>> => {
    try {
      const { data } = await axios.get(
        `${config.server}/api/leagues/${competitionId}/fixtures`,
      );
      return data;
    } catch (error) {
      handleError(error as AppError, {
        showToast: true,
        logError: true,
        throwError: false,
      });
      throw error;
    }
  };

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
