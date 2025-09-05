import { CompetitionResponse } from "@repo/shared-types";
import axios from "axios";
import { config } from "../config/config";
import { useQuery } from "@tanstack/react-query";
import { useErrorHandler } from "./use-error-handler/use-error-handler";
import { AppError } from "./use-error-handler/types";

export const useCompetition = (compId: string, userId: string) => {
  const { handleError } = useErrorHandler();

  const fetchCompetition = async (
    compId: string,
    userId: string,
  ): Promise<CompetitionResponse> => {
    try {
      const params = new URLSearchParams({
        compId,
        userId,
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
    queryKey: ["competition", compId, userId],
    queryFn: () => fetchCompetition(compId, userId),
    enabled: !!compId && !!userId,
  });

  return {
    competition: competitionQuery.data,
    isLoading: competitionQuery.isLoading,
    refetch: competitionQuery.refetch,
    error: competitionQuery.error,
  };
};
