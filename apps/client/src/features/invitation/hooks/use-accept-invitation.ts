import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/config/axios-config";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export function useAcceptInvitation(invitedBy?: string) {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (token: string) => {
      await axiosInstance.post(`/api/invitations/${token}/accept`);
    },
    onSuccess: () => {
      navigate("/dashboard", { state: { showSuccessToast: true, invitedBy } });
    },
    onError: (error) => {
      let errorMessage = "Failed to accept invitation";
      if (isAxiosError(error)) {
        errorMessage = error.response?.data?.error || errorMessage;
      }
      toast.error(errorMessage);
    },
  });
}
