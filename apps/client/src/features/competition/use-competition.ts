import { CompetitionResponse } from "@repo/shared-types";
import axios from "axios";
import { config } from "../../config/config";
import { useQuery } from "@tanstack/react-query";
import { useErrorHandler } from "../../hooks/use-error-handler/use-error-handler";
import { AppError } from "../../hooks/use-error-handler/types";
import { SeasonParam, seasonQuery } from "./use-season-param";
import { competitionKeys } from "./query-keys";

interface CompetitionReadOptions {
  /**
   * Whether the read may go. The page holds it back while the client cannot
   * yet vouch for `season` (a `?season=` value before the season list is in),
   * so a stale link's season never reaches the server.
   */
  enabled?: boolean;
}

/**
 * The competition stats read. `season` is the URL value passed through
 * verbatim, absent included; the Current season needs no vouching, so that
 * common path never waits on the season list.
 */
export const useCompetition = (
  compId: string,
  userId?: string,
  season?: SeasonParam,
  { enabled = true }: CompetitionReadOptions = {},
) => {
  const { handleError } = useErrorHandler();

  const fetchCompetition = async (
    compId: string,
    userId?: string,
    season?: SeasonParam,
  ): Promise<CompetitionResponse> => {
    try {
      const paramsObj: Record<string, string> = { compId };
      if (typeof userId === "string") {
        paramsObj.userId = userId;
      }
      const params = new URLSearchParams({
        ...paramsObj,
        ...seasonQuery(season),
      });
      const { data } = await axios.get(
        `${config.server}/api/competitions/stats?${params.toString()}`,
        {
          withCredentials: true,
        },
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
  const competitionQuery = useQuery({
    queryKey: competitionKeys.detail(compId, userId, season),
    queryFn: () => fetchCompetition(compId, userId, season),
    enabled: !!compId && enabled,
    staleTime: 5 * 60 * 1000,
  });

  return {
    competition: competitionQuery.data,
    isLoading: competitionQuery.isLoading,
    refetch: competitionQuery.refetch,
    error: competitionQuery.error,
  };
};
