import { CompetitionInfo } from "@repo/shared-types";
import axios from "axios";
import { config } from "../../config/config";
import { useQuery } from "@tanstack/react-query";
import { useErrorHandler } from "../../hooks/use-error-handler/use-error-handler";
import { AppError } from "../../hooks/use-error-handler/types";

/**
 * The header read of every season-aware page: name, type, the user's role and
 * the season list. Keyed per user, so two users never share a cached role,
 * with `["competitionInfo", compId]` as the prefix a competition-wide
 * invalidation can target.
 */
export const useCompetitionInfo = (compId: string, userId?: string) => {
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
    queryKey: ["competitionInfo", compId, userId],
    queryFn: () => fetchCompetitionInfo(compId, userId),
    enabled: !!compId,
  });

  return {
    competition: competitionQuery.data,
    isLoading: competitionQuery.isLoading,
    refetch: competitionQuery.refetch,
    error: competitionQuery.error,
  };
};
