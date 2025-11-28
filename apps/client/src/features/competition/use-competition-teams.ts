import { CompetitionWithTeams } from "@repo/shared-types";
import axios from "axios";
import { config } from "../../config/config";
import { useQuery } from "@tanstack/react-query";
import { useErrorHandler } from "../../hooks/use-error-handler/use-error-handler";
import { AppError } from "../../hooks/use-error-handler/types";

export const useCompetitionTeams = (compId: string, userId: string) => {
  const { handleError } = useErrorHandler();

  const fetchCompetitionTeams = async (
    compId: string,
    userId: string,
  ): Promise<CompetitionWithTeams> => {
    try {
      const params = new URLSearchParams({
        compId,
        userId,
      });
      const { data } = await axios.get(
        `${config.server}/api/competitions/teams?${params.toString()}`,
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
    queryKey: ["competitionTeams", compId, userId],
    queryFn: () => fetchCompetitionTeams(compId, userId),
    enabled: !!compId && !!userId,
  });

  return {
    competition: competitionQuery.data,
    isLoading: competitionQuery.isLoading,
    refetch: competitionQuery.refetch,
    error: competitionQuery.error,
  };
};
