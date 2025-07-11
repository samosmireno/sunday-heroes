import { CompetitionResponse } from "@repo/shared-types";
import axios from "axios";
import { config } from "../config/config";
import { useQuery } from "@tanstack/react-query";

const fetchCompetition = async (
  compId: string,
  userId: string,
): Promise<CompetitionResponse> => {
  const params = new URLSearchParams({
    compId,
    userId,
  });
  const { data } = await axios.get(
    `${config.server}/api/competitions/stats?${params.toString()}`,
    {
      withCredentials: true,
    },
  );
  return data;
};

export const useCompetition = (compId: string, userId: string) => {
  const competitionQuery = useQuery({
    queryKey: ["competition"],
    queryFn: () => fetchCompetition(compId, userId),
    enabled: !!compId && !!userId,
  });

  return {
    competition: competitionQuery.data,
    isLoading: competitionQuery.isLoading,
    refetch: competitionQuery.refetch,
    error: competitionQuery.error,
  };
};
