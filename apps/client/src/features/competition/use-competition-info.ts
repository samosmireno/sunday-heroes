import { CompetitionInfo } from "@repo/shared-types";
import axios from "axios";
import { config } from "../../config/config";
import { useQuery } from "@tanstack/react-query";
import { useErrorHandler } from "../../hooks/use-error-handler/use-error-handler";
import { AppError } from "../../hooks/use-error-handler/types";

export const useCompetitionInfo = (compId: string) => {
  const { handleError } = useErrorHandler();

  const fetchCompetitionInfo = async (
    compId: string,
  ): Promise<CompetitionInfo> => {
    try {
      const params = new URLSearchParams({
        compId,
      });
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
    queryKey: ["competitionInfo", compId],
    queryFn: () => fetchCompetitionInfo(compId),
    enabled: !!compId,
  });

  return {
    competition: competitionQuery.data,
    isLoading: competitionQuery.isLoading,
    refetch: competitionQuery.refetch,
    error: competitionQuery.error,
  };
};
