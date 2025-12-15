import { config } from "@/config/config";
import { AppError } from "@/hooks/use-error-handler/types";
import { useErrorHandler } from "@/hooks/use-error-handler/use-error-handler";
import { PerformanceChartResponse } from "@repo/shared-types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchPerformance = async (
  playerId: string,
  competitionId: string,
  range?: number,
): Promise<PerformanceChartResponse> => {
  const { data } = await axios.get<PerformanceChartResponse>(
    `${config.server}/api/players/${playerId}/stats/performance/${competitionId}?range=${range}`,
  );
  return data;
};

export const usePerformanceData = (
  playerId: string,
  competitionId: string,
  range?: number,
) => {
  const { handleError } = useErrorHandler();

  const query = useQuery({
    queryKey: ["playerPerformanceData", playerId, competitionId, range],
    queryFn: async () => {
      try {
        return await fetchPerformance(playerId, competitionId, range);
      } catch (error) {
        handleError(error as AppError, {
          showToast: true,
          logError: true,
          throwError: false,
        });
        throw error;
      }
    },
    enabled: !!playerId && !!competitionId,
  });

  return {
    performanceData: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
