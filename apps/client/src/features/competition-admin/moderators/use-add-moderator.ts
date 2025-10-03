import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/config/axios-config";
import { config } from "@/config/config";
import { toast } from "sonner";

export function useAddModerator(competitionId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      await axiosInstance.post(
        `${config.server}/api/competitions/${competitionId}/moderators`,
        { userId },
        { withCredentials: true },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["competition", competitionId],
      });
    },
  });

  const addModerator = async (userId: string, userNickname: string) => {
    try {
      await mutation.mutateAsync({ userId });
      toast.success(`${userNickname} has been added as a moderator`);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to add moderator. Please try again.";
      toast.error(errorMessage);
      return false;
    }
  };

  return {
    addModerator,
    isAdding: mutation.isPending,
  };
}
