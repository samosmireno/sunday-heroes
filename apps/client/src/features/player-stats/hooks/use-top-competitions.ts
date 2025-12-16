import { config } from "@/config/config";
import { AppError } from "@/hooks/use-error-handler/types";
import { useErrorHandler } from "@/hooks/use-error-handler/use-error-handler";
import { TopCompetitionsResponse } from "@repo/shared-types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useTopCompetitions = (playerId: string) => {
  const { handleError } = useErrorHandler();

  const fetchTopCompetititons = async (
    playerId: string,
  ): Promise<TopCompetitionsResponse> => {
    try {
      const { data } = await axios.get<TopCompetitionsResponse>(
        `${config.server}/api/players/${playerId}/stats/top-competitions`,
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

  const query = useQuery({
    queryKey: ["playerTopCompetitions", playerId],
    queryFn: () => fetchTopCompetititons(playerId),
    enabled: !!playerId,
  });

  return {
    topCompetitions: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
