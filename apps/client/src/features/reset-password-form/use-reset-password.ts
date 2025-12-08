import { config } from "@/config/config";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ResetPasswordRequest {
  token: string;
  password: string;
}

interface ResetPasswordResponse {
  message: string;
}

const resetPassword = async (
  data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> => {
  try {
    const response = await axios.post<ResetPasswordResponse>(
      `${config.server}/auth/reset-password`,
      data,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";
      throw new Error(message);
    }
    throw new Error("Failed to reset password. Please try again.");
  }
};

export function useResetPassword() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPassword(data),
    onSuccess: () => {
      toast.success("Password reset successfully! You can now log in.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to reset password. Please try again.",
      );
    },
  });

  return {
    resetPassword: mutation.mutate,
    resetPasswordAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
}
