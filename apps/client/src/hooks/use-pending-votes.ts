import axios, { AxiosError } from "axios";
import { config } from "../config/config";
import { CompetitionVotes } from "@repo/logger";
import { useQuery } from "@tanstack/react-query";

const fetchPendingVotes = async (
  competitionId: string,
): Promise<CompetitionVotes> => {
  const { data } = await axios.get(
    `${config.server}/api/admin/pending-votes/${competitionId}`,
  );
  return data;
};

export const usePendingVotes = (competitionId: string) => {
  const pendingVotesQuery = useQuery({
    queryKey: ["pending_votes"],
    queryFn: () => fetchPendingVotes(competitionId),
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
