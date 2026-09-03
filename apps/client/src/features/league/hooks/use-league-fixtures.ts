import axios from "axios";
import { config } from "../../../config/config";
import { useQuery } from "@tanstack/react-query";
import { LeagueMatchResponse } from "@repo/shared-types";
import { useErrorHandler } from "../../../hooks/use-error-handler/use-error-handler";
import { AppError } from "../../../hooks/use-error-handler/types";
import { SeasonParam } from "@/features/competition/use-season-param";

/** The selected season's Fixtures by round; `season` is the URL value, passed through verbatim. */
export const useLeagueFixtures = (
  competitionId: string,
  season?: SeasonParam,
) => {
  const { handleError } = useErrorHandler();

  const fetchLeagueFixtures = async (
    competitionId: string,
    season?: SeasonParam,
  ): Promise<Record<number, LeagueMatchResponse[]>> => {
    try {
      const query =
        season === undefined
          ? ""
          : `?${new URLSearchParams({ season: String(season) })}`;
      const { data } = await axios.get(
        `${config.server}/api/leagues/${competitionId}/fixtures${query}`,
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
    queryKey: ["leagueFixtures", competitionId, season],
    queryFn: () => fetchLeagueFixtures(competitionId, season),
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
