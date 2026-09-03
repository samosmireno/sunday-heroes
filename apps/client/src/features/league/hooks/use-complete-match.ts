import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../config/axios-config";
import { useErrorHandler } from "../../../hooks/use-error-handler/use-error-handler";
import { invalidateCompetitionReads } from "@/features/competition-admin/settings/use-competition-mutations";

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
      // Completing a Fixture writes the Standings counters and raises the
      // Current season's completedMatchCount, so every season-carrying read
      // of the Competition changes, not only its Fixtures.
      invalidateCompetitionReads(queryClient, competitionId);
      // The match-details read is keyed on the match, not the Competition,
      // so the shared helper does not reach it.
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
