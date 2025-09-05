import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { config } from "../config/config";
import { useErrorHandler } from "./use-error-handler";

interface VotePlayer {
  id: string;
  nickname: string;
  isHome: boolean;
  canVoteFor: boolean;
}

interface VotingStatus {
  matchId: string;
  votingOpen: boolean;
  votingEndsAt: string;
  hasVoted: boolean;
  players: VotePlayer[];
}

export const useVotingStatus = (matchId: string, voterId: string) => {
  const { handleError } = useErrorHandler();

  const fetchVotingStatus = async (
    matchId: string,
    voterId: string,
  ): Promise<VotingStatus> => {
    try {
      const { data } = await axios.get(
        `${config.server}/api/votes/status/${matchId}?voterId=${voterId}`,
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

  const votingStatusQuery = useQuery({
    queryKey: ["voting_status", matchId, voterId],
    queryFn: () => fetchVotingStatus(matchId, voterId),
  });

  return {
    votingStatus: votingStatusQuery.data,
    isLoading: votingStatusQuery.isLoading,
    refetch: votingStatusQuery.refetch,
    error:
      votingStatusQuery.error instanceof AxiosError
        ? votingStatusQuery.error.response?.data
        : votingStatusQuery.error,
  };
};
