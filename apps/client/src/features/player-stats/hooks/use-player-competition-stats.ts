import { config } from "@/config/config";
import { AppError } from "@/hooks/use-error-handler/types";
import { useErrorHandler } from "@/hooks/use-error-handler/use-error-handler";
import { PlayerCompetitionStats } from "@repo/shared-types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const usePlayerCompetitionStats = (playerId: string) => {
  const { handleError } = useErrorHandler();

  const fetchPlayerCompetititonStats = async (
    playerId: string,
  ): Promise<PlayerCompetitionStats[]> => {
    try {
      const { data } = await axios.get<PlayerCompetitionStats[]>(
        `${config.server}/api/players/${playerId}/stats/competitions`,
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
    queryKey: ["playerStatsByCompetition", playerId],
    queryFn: () => fetchPlayerCompetititonStats(playerId),
    enabled: !!playerId,
  });

  return {
    playerCompetitionStats: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
