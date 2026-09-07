import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { VoterEligibility } from "@repo/shared-types";
import { config } from "../../../config/config";
import { useErrorHandler } from "../../../hooks/use-error-handler/use-error-handler";
import { AppError } from "../../../hooks/use-error-handler/types";

interface VotePlayer {
  id: string;
  nickname: string;
  isHome: boolean;
  canVoteFor: boolean;
}

export interface VotingStatusResponse {
  matchId: string;
  votingOpen: boolean;
  votingEndsAt: string;
  hasVoted: boolean;
  /** Where the viewer stands with the Voting gate. Always present, never optional. */
  eligibility: VoterEligibility;
  /**
   * The Current season, for the banner that names it. A sibling of
   * `eligibility` rather than a member of it: the vote page is the only
   * surface that names a Season, and `VoterEligibility` rides on two other
   * response types with no use for one.
   */
  seasonNumber: number | null;
  players: VotePlayer[];
}

export const useVotingStatus = (matchId: string, voterId: string) => {
  const { handleError } = useErrorHandler();

  const fetchVotingStatus = async (
    matchId: string,
    voterId: string,
  ): Promise<VotingStatusResponse> => {
    try {
      const { data } = await axios.get(
        `${config.server}/api/votes/status/${matchId}?voterId=${voterId}`,
      );
      return data;
    } catch (error) {
      handleError(error as AppError, {
        showToast: true,
        logError: true,
        throwError: false,
      });
      throw error;
    }
  };

  const votingStatusQuery = useQuery({
    queryKey: ["votingStatus", { matchId, voterId }],
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
