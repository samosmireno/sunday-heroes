import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../config/axiosConfig";
import { useErrorHandler } from "./use-error-handler";

export const useCompleteMatch = (competitionId: string) => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async (matchId: string) => {
      const { data } = await axiosInstance.post(
        `/api/leagues/${competitionId}/matches/${matchId}/complete`,
      );
      return data;
    },
    onSuccess: (_, matchId) => {
      queryClient.invalidateQueries({ queryKey: ["leagueFixtures"] });
      queryClient.invalidateQueries({ queryKey: ["leagueFixtures", matchId] });
    },
    onError: (error) => {
      handleError(error, {
        showToast: true,
        logError: true,
        throwError: false,
      });
    },
  });
};
