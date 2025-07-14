import axios from "axios";
import { config } from "../config/config";
import { useQuery } from "@tanstack/react-query";
import { useErrorHandler } from "./use-error-handler";

export const useTeamList = (id: string) => {
  const { handleError } = useErrorHandler();

  const fetchTeamList = async (id: string): Promise<string[]> => {
    try {
      const { data } = await axios.get(`${config.server}/api/teams/list/${id}`);
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
