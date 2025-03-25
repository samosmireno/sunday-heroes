import { CompetitionType, DetailedCompetitionResponse } from "@repo/logger";
import axios, { AxiosError } from "axios";
import { config } from "../config/config";
import {
  useQuery,
  useQueryClient,
  QueryFunctionContext,
} from "@tanstack/react-query";
import { useEffect } from "react";

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

const POSTS_PER_PAGE = 9;

const fetchCompetitions = async (
  context: QueryFunctionContext<[string, CompetitionQueryParams]>,
): Promise<CompetitionResult> => {
  try {
    const [, { id, page, type, searchTerm }] = context.queryKey;

    const params = new URLSearchParams({
      userId: id,
      detailed: "true",
      page: page.toString(),
      limit: POSTS_PER_PAGE.toString(),
    });

    if (type) {
      params.append("type", type.toString());
    }

    if (searchTerm) {
      params.append("search", searchTerm);
    }

    const res = await axios.get(
      `${config.server}/api/competitions?${params.toString()}`,
    );
    const totalCount = parseInt(res.headers["x-total-count"] || "0", 10);
    const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

    return {
      data: res.data,
      totalCount,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching competitions:", error);
    throw error;
  }
};

export const useCompetitions = ({
  id,
  page,
  type,
  searchTerm,
}: CompetitionQueryParams) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["competitions", { id, page: page + 1, type, searchTerm }] as [
        string,
        CompetitionQueryParams,
      ],
      queryFn: fetchCompetitions,
    });
  }, [id, page, type, searchTerm, queryClient]);

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
