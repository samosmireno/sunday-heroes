import axios, { AxiosError } from "axios";
import { config } from "../config/config";
import { MatchVotes } from "@repo/shared-types";
import { useQuery } from "@tanstack/react-query";

const fetchPendingVotes = async (matchId: string): Promise<MatchVotes> => {
  const { data } = await axios.get(
    `${config.server}/api/votes/pending-votes/${matchId}`,
  );
  return data;
};

export const usePendingVotes = (matchId: string) => {
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
