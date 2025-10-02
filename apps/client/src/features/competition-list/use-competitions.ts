import {
  CompetitionType,
  DetailedCompetitionResponse,
} from "@repo/shared-types";
import axios, { AxiosError } from "axios";
import { config } from "../../config/config";
import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import { useErrorHandler } from "../../hooks/use-error-handler/use-error-handler";
import { AppError } from "../../hooks/use-error-handler/types";

interface CompetitionQueryParams {
  id: string;
  page: number;
  type?: CompetitionType | null;
  searchTerm?: string;
}

interface CompetitionResult {
  data: DetailedCompetitionResponse[];
  totalCount: number;
  totalPages: number;
}

export const useCompetitions = ({
  id,
  page,
  type,
  searchTerm,
}: CompetitionQueryParams) => {
  const { handleError } = useErrorHandler();

  const fetchCompetitions = async (
    context: QueryFunctionContext<[string, CompetitionQueryParams]>,
  ): Promise<CompetitionResult> => {
    try {
      const [, { id, page, type, searchTerm }] = context.queryKey;

      const params = new URLSearchParams({
        userId: id,
        detailed: "true",
        page: page.toString(),
        limit: config.pagination.competition_per_page.toString(),
      });

      if (type) {
        params.append("type", type.toString());
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const res = await axios.get(
        `${config.server}/api/competitions/detailed?${params.toString()}`,
      );
      const totalCount = parseInt(res.headers["x-total-count"] || "0", 10);
      const totalPages = Math.ceil(
        totalCount / config.pagination.competition_per_page,
      );

      return {
        data: res.data,
        totalCount,
        totalPages,
      };
    } catch (error) {
      handleError(error as AppError, {
        showToast: true,
        logError: true,
        throwError: false,
      });
      throw error;
    }
  };

  const { data, isLoading, refetch, isError, error } = useQuery<
    CompetitionResult,
    AxiosError,
    CompetitionResult,
    [string, CompetitionQueryParams]
  >({
    queryKey: ["competitions", { id, page, type, searchTerm }],
    queryFn: fetchCompetitions,
    placeholderData: (prevData) => prevData,
  });

  return {
    competitions: data?.data || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    refetch,
    isError,
    error,
  };
};
