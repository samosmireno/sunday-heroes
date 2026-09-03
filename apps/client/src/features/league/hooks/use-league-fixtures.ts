import axios from "axios";
import { useCallback } from "react";
import { config } from "../../../config/config";
import { useQuery } from "@tanstack/react-query";
import { LeagueMatchResponse } from "@repo/shared-types";
import { useErrorHandler } from "../../../hooks/use-error-handler/use-error-handler";
import { AppError } from "../../../hooks/use-error-handler/types";
import {
  SeasonParam,
  withSeasonQuery,
} from "@/features/competition/use-season-param";
import { groupFixtures } from "../group-fixtures";

/**
 * The selected season's Fixtures; `season` is the URL value, passed through
 * verbatim. The server answers one flat list (season descending, round and
 * date ascending) which the cache keeps; the hook regroups it for the tab
 * through React Query's `select`.
 */
export const useLeagueFixtures = (
  competitionId: string,
  season?: SeasonParam,
) => {
  const { handleError } = useErrorHandler();

  const fetchLeagueFixtures = async (
    competitionId: string,
    season?: SeasonParam,
  ): Promise<LeagueMatchResponse[]> => {
    try {
      const { data } = await axios.get(
        withSeasonQuery(
          `${config.server}/api/leagues/${competitionId}/fixtures`,
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

  const regroup = useCallback(
    (matches: LeagueMatchResponse[]) => groupFixtures(matches, season),
    [season],
  );

  const leagueFixturesQuery = useQuery({
    queryKey: ["leagueFixtures", competitionId, season],
    queryFn: () => fetchLeagueFixtures(competitionId, season),
    select: regroup,
    enabled: !!competitionId,
    staleTime: 0,
  });

  return {
    leagueFixtures: leagueFixturesQuery.data,
    isFixturesLoading: leagueFixturesQuery.isLoading,
    refetch: leagueFixturesQuery.refetch,
    error: leagueFixturesQuery.error,
  };
};
