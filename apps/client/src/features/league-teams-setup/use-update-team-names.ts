import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { UpdateTeamNamesResponse } from "@repo/shared-types";
import axiosInstance from "@/config/axios-config";
import { useErrorHandler } from "@/hooks/use-error-handler/use-error-handler";
import { AppError } from "@/hooks/use-error-handler/types";

interface TeamUpdate {
  id: string;
  name: string;
}

interface UpdateTeamNamesData {
  competitionId: string;
  teamUpdates: TeamUpdate[];
}

/**
 * The Teams setup save. On success every read the save can change is
 * refreshed (the team names, the info read the router gates on, and the
 * Fixtures the save may have generated) before landing on the League page.
 */
export function useUpdateTeamNames() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async ({ competitionId, teamUpdates }: UpdateTeamNamesData) => {
      return axiosInstance.patch<UpdateTeamNamesResponse>(
        `/api/leagues/${competitionId}/team-names`,
        { teamUpdates },
      );
    },
    onSuccess: async (_, { competitionId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["competition", { compId: competitionId }],
        }),
        queryClient.invalidateQueries({
          queryKey: ["competitionTeams", competitionId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["competitionInfo", competitionId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["leagueFixtures", competitionId],
        }),
      ]);
      navigate(`/competition/${competitionId}`);
    },
    onError: (error) => {
      handleError(error as AppError, {
        showToast: true,
        logError: true,
        throwError: false,
      });
    },
  });
}
