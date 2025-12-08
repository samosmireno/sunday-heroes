import { config } from "@/config/config";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

const forgotPassword = async (
  data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> => {
  try {
    const response = await axios.post<ForgotPasswordResponse>(
      `${config.server}/auth/forgot-password`,
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
        "Failed to send reset email. Please try again.";
      throw new Error(message);
    }
    throw new Error("Failed to send reset email. Please try again.");
  }
};

export function useForgotPassword() {
  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordRequest) => forgotPassword(data),
    onSuccess: () => {
      toast.success("Check your inbox for password reset instructions.");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to send reset email. Please try again.",
      );
    },
  });

  return {
    forgotPassword: mutation.mutate,
    forgotPasswordAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
}
