import { CompetitionResponse } from "@repo/shared-types";
import axios from "axios";
import { config } from "../../config/config";
import { useQuery } from "@tanstack/react-query";
import { useErrorHandler } from "../../hooks/use-error-handler/use-error-handler";
import { AppError } from "../../hooks/use-error-handler/types";
import { SeasonParam } from "./use-season-param";

/**
 * The competition stats read. `season` is the URL value passed through
 * verbatim, absent included, so the read never waits on the season list.
 */
export const useCompetition = (
  compId: string,
  userId?: string,
  season?: SeasonParam,
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
      if (season !== undefined) {
        paramsObj.season = String(season);
      }
      const params = new URLSearchParams(paramsObj);
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
    queryKey: ["competition", { compId, userId, season }],
    queryFn: () => fetchCompetition(compId, userId, season),
    enabled: !!compId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    competition: competitionQuery.data,
    isLoading: competitionQuery.isLoading,
    refetch: competitionQuery.refetch,
    error: competitionQuery.error,
  };
};
