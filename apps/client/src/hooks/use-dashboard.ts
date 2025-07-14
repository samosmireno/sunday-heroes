import axios from "axios";
import { config } from "../config/config";
import {
  DashboardCompetitionResponse,
  DashboardMatchResponse,
  DashboardResponse,
} from "@repo/shared-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useErrorHandler } from "./use-error-handler";

export const useDashboard = (id: string) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  const fetchDashboard = async (
    id: string,
  ): Promise<DashboardResponse | undefined> => {
    try {
      if (!id) return {} as DashboardResponse;
      const { data } = await axios.get(`${config.server}/api/dashboard/${id}`);
      return data;
    } catch (error) {
      handleError(error, {
        showToast: true,
        logError: true,
        throwError: false,
      });
      throw error;
    }
  };

  const fetchDashboardMatches = async (
    id: string,
  ): Promise<DashboardMatchResponse[]> => {
    try {
      if (!id) return [];
      const { data } = await axios.get(
        `${config.server}/api/matches/dashboard?userId=${id}`,
      );
      return data;
    } catch (error) {
      handleError(error, {
        showToast: true,
        logError: true,
        throwError: false,
      });
      throw error;
    }
  };

  const fetchDashboardCompetitions = async (
    id: string,
  ): Promise<DashboardCompetitionResponse[]> => {
    try {
      if (!id) return [];

      const params = new URLSearchParams({ userId: id, detailed: "false" });

      const { data } = await axios.get(
        `${config.server}/api/competitions?${params.toString()}`,
      );
      return data;
    } catch (error) {
      handleError(error, {
        showToast: true,
        logError: true,
        throwError: false,
      });
      throw error;
    }
  };

  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboard(id),
    enabled: !!id,
  });

  const matchesQuery = useQuery({
    queryKey: ["dashboard_matches"],
    queryFn: () => fetchDashboardMatches(id),
    enabled: !!id,
  });

  const competitionsQuery = useQuery({
    queryKey: ["dashboard_competitions", id],
    queryFn: () => fetchDashboardCompetitions(id),
    enabled: !!id,
  });

  const refreshData = async () => {
    if (!id) return;

    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["dashboard", id] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard_matches", id] }),
      queryClient.invalidateQueries({
        queryKey: ["dashboard_competitions", id],
      }),
    ]);
    setIsRefreshing(false);
  };

  return {
    dashboardData: dashboardQuery.data,
    dashboardMatches: matchesQuery.data,
    dashboardCompetitions: competitionsQuery.data,
    isLoading:
      !id ||
      dashboardQuery.isLoading ||
      matchesQuery.isLoading ||
      competitionsQuery.isLoading,
    isRefreshing,
    refreshData,
    error: dashboardQuery.error,
  };
};
