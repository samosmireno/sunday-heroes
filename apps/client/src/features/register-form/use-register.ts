import { config } from "@/config/config";
import { useAuth } from "@/context/auth-context";
import { RegisterRequest, RegisterResponse } from "@repo/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await axios.post<RegisterResponse>(
      `${config.server}/auth/register`,
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
      const message = error.response?.data?.message || "Registration failed";
      throw new Error(message);
    }
    throw new Error("Registration failed");
  }
};

interface UseRegisterOptions {
  onSuccess?: () => void;
  redirectTo?: string;
  invitedBy?: string;
}

export function useRegister(options?: UseRegisterOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUserData } = useAuth();

  const mutation = useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      setUserData(data);

      if (options?.onSuccess) {
        options.onSuccess();
      }

      navigate(options?.redirectTo || "/dashboard", {
        state: {
          showSuccessToast: true,
          invitedBy: options?.invitedBy,
          registered: true,
        },
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed. Please try again.");
    },
  });

  return {
    register: mutation.mutate,
    registerAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
}
