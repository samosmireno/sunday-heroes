import { CompetitionResponse } from "@repo/logger";
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
    `${config.server}/api/competition?${params.toString()}`,
  );
  return data;
};

export const useCompetition = (compId: string, userId: string) => {
  const competitionQuery = useQuery({
    queryKey: ["competition"],
    queryFn: () => fetchCompetition(compId, userId),
  });

  return {
    competition: competitionQuery.data,
    isLoading: competitionQuery.isLoading,
    refetch: competitionQuery.refetch,
  };
};
