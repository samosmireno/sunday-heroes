import { CompetitionInfo } from "@repo/shared-types";
import axios from "axios";
import { config } from "../../config/config";
import { skipToken, useQuery } from "@tanstack/react-query";
import { useErrorHandler } from "../../hooks/use-error-handler/use-error-handler";
import { AppError } from "../../hooks/use-error-handler/types";
import { competitionKeys } from "./query-keys";

/**
 * The header read of every season-aware page: name, type, the user's role and
 * the season list. Keyed per user, so two users never share a cached role,
 * with `competitionKeys.infoPrefix` as the prefix a competition-wide
 * invalidation can target. Without a competition there is nothing to read.
 */
export const useCompetitionInfo = (
  compId: string | undefined,
  userId?: string,
) => {
  const { handleError } = useErrorHandler();

  const fetchCompetitionInfo = async (
    compId: string,
    userId?: string,
  ): Promise<CompetitionInfo> => {
    try {
      const params = new URLSearchParams({ compId });
      if (userId) {
        params.set("userId", userId);
      }
      const { data } = await axios.get(
        `${config.server}/api/competitions/info?${params.toString()}`,
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
    queryKey: competitionKeys.info(compId, userId),
    queryFn: compId ? () => fetchCompetitionInfo(compId, userId) : skipToken,
  });

  return {
    competition: competitionQuery.data,
    isLoading: competitionQuery.isLoading,
    refetch: competitionQuery.refetch,
    error: competitionQuery.error,
  };
};
