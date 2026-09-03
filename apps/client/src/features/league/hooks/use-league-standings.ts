import axios from "axios";
import { config } from "../../../config/config";
import { useQuery } from "@tanstack/react-query";
import { LeagueTeamResponse } from "@repo/shared-types";
import { useErrorHandler } from "../../../hooks/use-error-handler/use-error-handler";
import { AppError } from "../../../hooks/use-error-handler/types";
import {
  SeasonParam,
  withSeasonQuery,
} from "@/features/competition/use-season-param";

/** The selected season's Standings; `season` is the URL value, passed through verbatim. */
export const useLeagueStandings = (
  competitionId: string,
  season?: SeasonParam,
) => {
  const { handleError } = useErrorHandler();

  const fetchLeagueStandings = async (
    competitionId: string,
    season?: SeasonParam,
  ): Promise<LeagueTeamResponse[]> => {
    try {
      const { data } = await axios.get(
        withSeasonQuery(
          `${config.server}/api/leagues/${competitionId}/standings`,
          season,
        ),
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

  const leagueStandingsQuery = useQuery({
    queryKey: ["leagueStandings", competitionId, season],
    queryFn: () => fetchLeagueStandings(competitionId, season),
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
