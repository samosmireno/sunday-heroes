import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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

export function useUpdateTeamNames() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async ({ competitionId, teamUpdates }: UpdateTeamNamesData) => {
      return axiosInstance.patch(`/api/leagues/${competitionId}/team-names`, {
        teamUpdates,
      });
    },
    onSuccess: (_, { competitionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["competition", competitionId],
      });
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
