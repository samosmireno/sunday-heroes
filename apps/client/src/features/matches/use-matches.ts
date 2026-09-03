import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { config } from "../../config/config";
import { MatchPageResponse } from "@repo/shared-types";
import { useErrorHandler } from "../../hooks/use-error-handler/use-error-handler";
import { AppError } from "../../hooks/use-error-handler/types";
import {
  SeasonParam,
  seasonQuery,
} from "@/features/competition/use-season-param";

interface MatchQueryParams {
  userId: string;
  competitionId?: string;
  page: number;
  /** The selected season as the URL holds it, passed through verbatim. */
  season?: SeasonParam;
}

interface MatchesReadParams extends MatchQueryParams {
  /**
   * Whether the read may go. The page holds it back while the client cannot
   * yet vouch for `season` (a `?season=` value before the season list is in),
   * so a stale link's season never reaches the server.
   */
  enabled?: boolean;
}

interface MatchesResult {
  data: MatchPageResponse[];
  totalCount: number;
  totalPages: number;
}

/** One list, paged: the same user, competition and season. */
const sameList = (a: MatchQueryParams, b: MatchQueryParams) =>
  a.userId === b.userId &&
  a.competitionId === b.competitionId &&
  a.season === b.season;

/**
 * The paginated All Matches read. While the next page of a list loads, the
 * previous page stays in place; another list (a season switch) starts blank,
 * so its rows and counts never describe the wrong season.
 */
export const useMatches = ({
  userId,
  competitionId,
  page,
  season,
  enabled = true,
}: MatchesReadParams) => {
  const { handleError } = useErrorHandler();

  // Only a competition's list is season-scoped: the server refuses a season
  // without a competition, so the user-wide read never sends or keys on one,
  // and never waits on one either.
  const seasonScoped = competitionId !== undefined;
  const scope: MatchQueryParams = {
    userId,
    competitionId,
    page,
    season: seasonScoped ? season : undefined,
  };

  const fetchMatches = async (
    context: QueryFunctionContext<[string, MatchQueryParams]>,
  ): Promise<MatchesResult> => {
    try {
      const [, { userId, competitionId, page, season }] = context.queryKey;
      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: config.pagination.matches_per_page.toString(),
        ...(competitionId ? { competitionId } : {}),
        ...seasonQuery(season),
      });

      const res = await axios.get(
        `${config.server}/api/matches/stats?${params.toString()}`,
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
      handleError(error as AppError, {
        showToast: true,
        logError: true,
        throwError: false,
      });
      throw error;
    }
  };

  const { data, isLoading, isPending, refetch, isError, error } = useQuery<
    MatchesResult,
    AxiosError,
    MatchesResult,
    [string, MatchQueryParams]
  >({
    queryKey: ["matches", scope],
    queryFn: fetchMatches,
    enabled: !seasonScoped || enabled,
    placeholderData: (prevData, prevQuery) =>
      prevQuery && sameList(prevQuery.queryKey[1], scope)
        ? prevData
        : undefined,
  });

  return {
    matches: data?.data || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    /** No answer yet: the read is in flight, or still waiting on the season. */
    isPending,
    refetch,
    isError,
    error,
  };
};
