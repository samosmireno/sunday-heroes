import axios from "axios";
import { config } from "../../config/config";
import { DashboardResponse } from "@repo/shared-types";
import { useQuery } from "@tanstack/react-query";
import { useErrorHandler } from "../../hooks/use-error-handler/use-error-handler";
import { AppError } from "../../hooks/use-error-handler/types";

export const useDashboard = (id: string) => {
  const { handleError } = useErrorHandler();

  const fetchDashboard = async (
    id: string,
  ): Promise<DashboardResponse | undefined> => {
    try {
      const { data } = await axios.get(`${config.server}/api/dashboard/${id}`);
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

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ["dashboard", id],
    queryFn: () => fetchDashboard(id),
    enabled: !!id,
  });

  return {
    dashboard: data,
    isLoading: !id || isLoading,
    refetch,
    error,
  };
};
