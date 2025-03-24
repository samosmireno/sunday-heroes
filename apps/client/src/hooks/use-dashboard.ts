import axios from "axios";
import { config } from "../config/config";
import {
  DashboardCompetitionResponse,
  DashboardMatchResponse,
  DashboardResponse,
  DashboardVoteResponse,
} from "@repo/logger";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { calculatePendingVotes } from "../utils/utils";

const fetchDashboard = async (id: string): Promise<DashboardResponse> => {
  if (!id) return {} as DashboardResponse;
  const { data } = await axios.get(`${config.server}/api/dashboard/${id}`);
  return data;
};

const fetchDashboardMatches = async (
  id: string,
): Promise<DashboardMatchResponse[]> => {
  if (!id) return [];
  const { data } = await axios.get(`${config.server}/api/matches?userId=${id}`);
  return data;
};

const fetchDashboardCompetitions = async (
  id: string,
): Promise<DashboardCompetitionResponse[]> => {
  if (!id) return [];

  const params = new URLSearchParams({ userId: id, detailed: "false" });

  const { data } = await axios.get(
    `${config.server}/api/competitions?${params.toString()}`,
  );
  return data;
};

const fetchDashboardVotes = async (
  id: string,
): Promise<DashboardVoteResponse[]> => {
  if (!id) return [];
  const { data } = await axios.get(`${config.server}/api/votes?userId=${id}`);
  return data;
};

export const useDashboard = (id: string) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [pendingVotes, setPendingVotes] = useState<number>(0);
  const queryClient = useQueryClient();

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

  const votesQuery = useQuery({
    queryKey: ["dashboard_votes"],
    queryFn: () => fetchDashboardVotes(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (matchesQuery.data && votesQuery.data) {
      setPendingVotes(
        calculatePendingVotes(matchesQuery.data, votesQuery.data),
      );
    }
  }, [matchesQuery.data, votesQuery.data]);

  const refreshData = async () => {
    if (!id) return;

    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["dashboard", id] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard_matches", id] }),
      queryClient.invalidateQueries({
        queryKey: ["dashboard_competitions", id],
      }),
      queryClient.invalidateQueries({ queryKey: ["dashboard_votes", id] }),
    ]);
    setIsRefreshing(false);
  };

  return {
    dashboardData: dashboardQuery.data,
    dashboardMatches: matchesQuery.data,
    dashboardCompetitions: competitionsQuery.data,
    dashboardVotes: votesQuery.data,
    isLoading:
      !id ||
      dashboardQuery.isLoading ||
      matchesQuery.isLoading ||
      competitionsQuery.isLoading ||
      votesQuery.isLoading,
    isRefreshing,
    refreshData,
    pendingVotes,
  };
};
