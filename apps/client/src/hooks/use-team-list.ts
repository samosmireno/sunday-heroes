import axios from "axios";
import { config } from "../config/config";
import { useQuery } from "@tanstack/react-query";

const fetchTeamList = async (id: string): Promise<string[]> => {
  const { data } = await axios.get(`${config.server}/api/teams/list/${id}`);
  return data;
};

export const useTeamList = (id: string) => {
  const teamListQuery = useQuery({
    queryKey: ["teamList", id],
    queryFn: () => fetchTeamList(id),
    enabled: !!id,
  });

  return {
    teamList: teamListQuery.data,
    isLoading: teamListQuery.isLoading,
    refetch: teamListQuery.refetch,
  };
};
