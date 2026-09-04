import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { UpdateTeamNamesResponse } from "@repo/shared-types";
import axiosInstance from "@/config/axios-config";
import { useErrorHandler } from "@/hooks/use-error-handler/use-error-handler";
import { AppError } from "@/hooks/use-error-handler/types";
import {
  competitionKeys,
  invalidateCompetitionReads,
} from "@/features/competition/query-keys";

interface TeamUpdate {
  id: string;
  name: string;
}

interface UpdateTeamNamesData {
  competitionId: string;
  teamUpdates: TeamUpdate[];
}

/**
 * The Teams setup save. On success every read of the Competition is refreshed
 * (the team names, the info read the router gates on, and the Fixtures the
 * save may have generated) before landing on the League page.
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
        invalidateCompetitionReads(queryClient, competitionId),
        // The team names are the one read of the family that only this save
        // changes, so they are not on the shared list.
        queryClient.invalidateQueries({
          queryKey: competitionKeys.teams(competitionId),
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
