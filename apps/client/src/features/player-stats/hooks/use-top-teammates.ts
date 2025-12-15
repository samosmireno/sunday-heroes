import { config } from "@/config/config";
import { AppError } from "@/hooks/use-error-handler/types";
import { useErrorHandler } from "@/hooks/use-error-handler/use-error-handler";
import { TeammateStats } from "@repo/shared-types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchTopTeammates = async (
  playerId: string,
): Promise<TeammateStats[]> => {
  const { data } = await axios.get<TeammateStats[]>(
    `${config.server}/api/players/${playerId}/stats/top-teammates`,
  );
  return data;
};

export const useTopTeammates = (playerId: string) => {
  const { handleError } = useErrorHandler();

  const query = useQuery({
    queryKey: ["playerTopTeammates", playerId],
    queryFn: async () => {
      try {
        return await fetchTopTeammates(playerId);
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
    topTeammates: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
