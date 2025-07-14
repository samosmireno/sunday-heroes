import axios, { AxiosError } from "axios";
import { config } from "../config/config";
import { MatchVotes } from "@repo/shared-types";
import { useQuery } from "@tanstack/react-query";
import { useErrorHandler } from "./use-error-handler";

export const usePendingVotes = (matchId: string) => {
  const { handleError } = useErrorHandler();

  const fetchPendingVotes = async (matchId: string): Promise<MatchVotes> => {
    try {
      const { data } = await axios.get(
        `${config.server}/api/votes/pending-votes/${matchId}`,
      );
      return data;
    } catch (error) {
      handleError(error, {
        showToast: true,
        logError: true,
        throwError: false,
      });
      throw error;
    }
  };

  const pendingVotesQuery = useQuery({
    queryKey: ["pending_votes"],
    queryFn: () => fetchPendingVotes(matchId),
  });

  return {
    votingData: pendingVotesQuery.data,
    isLoading: pendingVotesQuery.isLoading,
    refetch: pendingVotesQuery.refetch,
    error:
      pendingVotesQuery.error instanceof AxiosError
        ? pendingVotesQuery.error.response?.data
        : pendingVotesQuery.error,
  };
};
