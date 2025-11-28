import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { config } from "@/config/config";
import { toast } from "sonner";
import { AppError } from "@/hooks/use-error-handler/types";

export function useRemoveModerator(competitionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moderatorId: string) => {
      return axiosInstance.delete(
        `${config.server}/api/competitions/moderators/${moderatorId}`,
        { withCredentials: true },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["competitionSettings", competitionId],
      });

      toast.success("Moderator removed successfully");
    },
    onError: (error: AppError) => {
      console.error("Error removing moderator:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to remove moderator. Please try again.";
      toast.error(errorMessage);
    },
  });
}
