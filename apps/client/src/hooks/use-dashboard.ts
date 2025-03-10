import axios from "axios";
import { config } from "../config/config";
import {
  DashboardCompetitionResponse,
  DashboardMatchResponse,
  DashboardResponse,
  DashboardVoteResponse,
} from "@repo/logger";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const fetchDashboard = async (id: string): Promise<DashboardResponse> => {
  const { data } = await axios.get(`${config.server}/api/dashboard/${id}`);
  return data;
};

const fetchDashboardMatches = async (
  id: string,
): Promise<DashboardMatchResponse[]> => {
  const { data } = await axios.get(
    `${config.server}/api/matches?dashboardId=${id}`,
  );
  return data;
};

const fetchDashboardCompetitions = async (
  id: string,
): Promise<DashboardCompetitionResponse[]> => {
  const { data } = await axios.get(
    `${config.server}/api/competitions?dashboardId=${id}`,
  );
  return data;
};

const fetchDashboardVotes = async (
  id: string,
): Promise<DashboardVoteResponse[]> => {
  const { data } = await axios.get(
    `${config.server}/api/votes?dashboardId=${id}`,
  );
  return data;
};

export const useDashboard = (id: string) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboard(id),
  });

  const matchesQuery = useQuery({
    queryKey: ["dashboard_matches"],
    queryFn: () => fetchDashboardMatches(id),
  });

  const competitionsQuery = useQuery({
    queryKey: ["dashboard_competitions"],
    queryFn: () => fetchDashboardCompetitions(id),
  });

  const votesQuery = useQuery({
    queryKey: ["dashboard_cvotes"],
    queryFn: () => fetchDashboardVotes(id),
  });

  return {
    isRefreshing,
    isLoading: dashboardQuery.isLoading,
    dashboardData: dashboardQuery.data,
    dashboardMatches: matchesQuery.data,
    dashboardCompetitions: competitionsQuery.data,
    dashboardVotes: votesQuery.data,
  };
};
