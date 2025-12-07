import { config } from "@/config/config";
import { useAuth } from "@/context/auth-context";
import { LoginRequest, LoginResponse } from "@repo/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(
      `${config.server}/auth/login`,
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
      const message = error.response?.data?.message || "Login failed";
      throw new Error(message);
    }
    throw new Error("Login failed");
  }
};

interface UseLoginOptions {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function useLogin(options?: UseLoginOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUserData } = useAuth();

  const mutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      setUserData(data);

      toast.success(`Welcome back, ${data.name}!`);

      if (options?.onSuccess) {
        options.onSuccess();
      }

      navigate(options?.redirectTo || "/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed. Please try again.");
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
}
