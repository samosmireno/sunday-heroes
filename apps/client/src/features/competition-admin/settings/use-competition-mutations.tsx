import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/config/axios-config";
import { config } from "@/config/config";
import { toast } from "sonner";
import { AppError } from "@/hooks/use-error-handler/types";

export function useResetCompetition(competitionId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.post(
        `${config.server}/api/competitions/${competitionId}/reset`,
        {},
        { withCredentials: true },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["competition", competitionId],
      });
      toast.success("Competition has been reset successfully");
      navigate("/competitions");
    },
    onError: (error: AppError) => {
      const message =
        error.response?.data?.message || "Failed to reset competition";
      toast.error(message);
    },
  });
}

export function useDeleteCompetition(competitionId: string) {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(
        `${config.server}/api/competitions/${competitionId}`,
        { withCredentials: true },
      );
    },
    onSuccess: () => {
      toast.success("Competition has been deleted successfully");
      navigate("/competitions");
    },
    onError: (error: AppError) => {
      const message =
        error.response?.data?.message || "Failed to delete competition";
      toast.error(message);
    },
  });
}
