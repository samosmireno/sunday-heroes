import { PlayerListResponse } from "@repo/shared-types";
import { useQuery, QueryFunctionContext } from "@tanstack/react-query";
import { config } from "../config/config";
import axios, { AxiosError } from "axios";
import { useErrorHandler } from "./use-error-handler/use-error-handler";
import { AppError } from "./use-error-handler/types";

interface PlayerListQueryParams {
  userId: string;
  page: number;
  limit?: number;
  searchTerm?: string;
}

interface PlayersListResult {
  players: PlayerListResponse[];
  totalCount: number;
  totalPages: number;
}

export const usePlayers = ({
  userId,
  page,
  searchTerm,
}: PlayerListQueryParams) => {
  const { handleError } = useErrorHandler();

  const fetchPlayers = async (
    context: QueryFunctionContext<[string, PlayerListQueryParams]>,
  ): Promise<PlayersListResult> => {
    try {
      const [, { userId, page, searchTerm }] = context.queryKey;

      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        limit: config.pagination.players_per_page.toString(),
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const res = await axios.get(
        `${config.server}/api/players?${params.toString()}`,
      );
      const totalCount = parseInt(res.headers["x-total-count"] || "0", 10);

      const totalPages = Math.ceil(
        totalCount / config.pagination.players_per_page,
      );

      return {
        players: res.data,
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
    PlayersListResult,
    AxiosError,
    PlayersListResult,
    [string, PlayerListQueryParams]
  >({
    queryKey: ["players", { userId, page, searchTerm }],
    queryFn: fetchPlayers,
    placeholderData: (prevData) => prevData,
  });

  return {
    players: data?.players || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    isLoading,
    isError,
    error,
    refetch,
  };
};
