import { DetailedCompetitionResponse } from "@repo/logger";
import axios from "axios";
import { config } from "../config/config";
import { useQuery } from "@tanstack/react-query";

const fetchCompetitions = async (
  id: string,
): Promise<DetailedCompetitionResponse[]> => {
  if (!id) return [];

  const params = new URLSearchParams({ userId: id, detailed: "true" });

  const { data } = await axios.get(
    `${config.server}/api/competitions?${params.toString()}`,
  );
  return data;
};

export const useCompetitions = (id: string) => {
  const competitionsQuery = useQuery({
    queryKey: ["competitions"],
    queryFn: () => fetchCompetitions(id),
  });

  return {
    competitions: competitionsQuery.data,
    isLoading: competitionsQuery.isLoading,
    refetch: competitionsQuery.refetch,
  };
};
