import axiosInstance from "@/config/axios-config";
import { MatchResponse } from "@repo/shared-types";
import { useQuery } from "@tanstack/react-query";
import { transformResponseToForm } from "../utils/match-transform";
import { useErrorHandler } from "@/hooks/use-error-handler/use-error-handler";
import { AppError } from "@/hooks/use-error-handler/types";

export const useFormMatchData = (matchId: string | undefined) => {
  const { handleError } = useErrorHandler();

  const fetchMatchData = async (matchId: string): Promise<MatchResponse> => {
    try {
      const response = await axiosInstance.get(`/api/matches/${matchId}`);
      return response.data;
    } catch (error) {
      handleError(error as AppError, {
        showToast: true,
        logError: true,
        throwError: false,
      });
      throw error;
    }
  };

  const {
    data: formData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["match-form-data", matchId],
    queryFn: () => fetchMatchData(matchId!),
    select: transformResponseToForm,
    enabled: Boolean(matchId),
    retry: 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    formData: formData || null,
    isLoading,
    error,
    isError,
  };
};
