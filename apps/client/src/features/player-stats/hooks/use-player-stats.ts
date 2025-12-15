import { config } from "@/config/config";
import { AppError } from "@/hooks/use-error-handler/types";
import { useErrorHandler } from "@/hooks/use-error-handler/use-error-handler";
import { PlayerStatsOverview } from "@repo/shared-types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchPlayerStats = async (
  playerId: string,
): Promise<PlayerStatsOverview> => {
  const { data } = await axios.get<PlayerStatsOverview>(
    `${config.server}/api/players/${playerId}/stats`,
  );
  return data;
};

export const usePlayerStats = (playerId: string) => {
  const { handleError } = useErrorHandler();

  const query = useQuery({
    queryKey: ["playerStats", playerId],
    queryFn: async () => {
      try {
        return await fetchPlayerStats(playerId);
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
    playerStats: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
