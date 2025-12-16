import { config } from "@/config/config";
import { AppError } from "@/hooks/use-error-handler/types";
import { useErrorHandler } from "@/hooks/use-error-handler/use-error-handler";
import { TopMatchesResponse } from "@repo/shared-types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useTopMatches = (playerId: string) => {
  const { handleError } = useErrorHandler();

  const fetchTopMatches = async (
    playerId: string,
  ): Promise<TopMatchesResponse> => {
    try {
      const { data } = await axios.get<TopMatchesResponse>(
        `${config.server}/api/players/${playerId}/stats/top-matches`,
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
    queryKey: ["playerTopMatches", playerId],
    queryFn: () => fetchTopMatches(playerId),
    enabled: !!playerId,
  });

  return {
    topMatches: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
