import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { config } from "../config/config";
import { MatchPageResponse } from "@repo/logger";

interface MatchQueryParams {
  userId: string;
  page: number;
}

interface MatchesResult {
  data: MatchPageResponse[];
  totalCount: number;
  totalPages: number;
}

const fetchMatches = async (
  context: QueryFunctionContext<[string, MatchQueryParams]>,
): Promise<MatchesResult> => {
  try {
    const [, { userId, page }] = context.queryKey;
    const params = new URLSearchParams({
      userId,
      page: page.toString(),
      limit: config.pagination.matches_per_page.toString(),
    });
    const res = await axios.get(
      `${config.server}/api/matches-with-stats?${params.toString()}`,
    );
    const totalCount = parseInt(res.headers["x-total-count"] || "0", 10);
    const totalPages = Math.ceil(
      totalCount / config.pagination.matches_per_page,
    );
    return {
      data: res.data,
      totalCount,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
};

export const useMatches = ({ userId, page }: MatchQueryParams) => {
  const { data, isLoading, refetch, isError, error } = useQuery<
    MatchesResult,
    AxiosError,
    MatchesResult,
    [string, MatchQueryParams]
  >({
    queryKey: ["matches", { userId, page }],
    queryFn: fetchMatches,
    placeholderData: (prevData) => prevData,
  });

  return {
    matches: data?.data || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    refetch,
    isError,
    error,
  };
};
