import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/axiosConfig";

export const useCompleteMatch = (competitionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      const { data } = await axiosInstance.post(
        `/api/leagues/${competitionId}/matches/${matchId}/complete`,
      );
      return data;
    },
    onSuccess: (data, matchId) => {
      queryClient.invalidateQueries({ queryKey: ["leagueFixtures"] });
      queryClient.invalidateQueries({ queryKey: ["leagueFixtures", matchId] });
    },
    onError: (error) => {
      console.error("Error completing match:", error);
    },
  });
};
