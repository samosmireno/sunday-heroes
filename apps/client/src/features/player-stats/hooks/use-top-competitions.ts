import { config } from "@/config/config";
import { AppError } from "@/hooks/use-error-handler/types";
import { useErrorHandler } from "@/hooks/use-error-handler/use-error-handler";
import { TopCompetitionsResponse } from "@repo/shared-types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchTopCompetititons = async (
  playerId: string,
): Promise<TopCompetitionsResponse> => {
  const { data } = await axios.get<TopCompetitionsResponse>(
    `${config.server}/api/players/${playerId}/stats/top-competitions`,
  );
  return data;
};

export const useTopCompetitions = (playerId: string) => {
  const { handleError } = useErrorHandler();

  const query = useQuery({
    queryKey: ["playerTopCompetitions", playerId],
    queryFn: async () => {
      try {
        return await fetchTopCompetititons(playerId);
      } catch (error) {
        handleError(error as AppError, {
          showToast: true,
          logError: true,
          throwError: false,
        });
        throw error;
      }
    },
    enabled: !!playerId,
  });

  return {
    topCompetitions: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
