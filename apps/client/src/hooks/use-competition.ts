import { CompetitionResponse } from "@repo/logger";
import axios from "axios";
import { config } from "../config/config";
import { useQuery } from "@tanstack/react-query";

const fetchCompetition = async (id: string): Promise<CompetitionResponse> => {
  const { data } = await axios.get(`${config.server}/api/competition/${id}`);
  return data;
};

export const useCompetition = (id: string) => {
  const competitionQuery = useQuery({
    queryKey: ["competition"],
    queryFn: () => fetchCompetition(id),
  });

  return {
    competition: competitionQuery.data,
    isLoading: competitionQuery.isLoading,
    refetch: competitionQuery.refetch,
  };
};
