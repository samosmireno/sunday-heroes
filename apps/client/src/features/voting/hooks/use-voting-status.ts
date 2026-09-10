import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { VoterEligibility } from "@repo/shared-types";
import axiosInstance from "../../../config/axios-config";
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
      // The ballot goes through the authenticated instance, not bare axios.
      // The endpoint is authenticated now — a ballot handed to a session the
      // server would refuse is a vote that cannot be cast — and this is also
      // what gives the read its one attempt at renewing an expired session
      // before the player has picked anybody.
      const { data } = await axiosInstance.get(
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
    error: readableError(votingStatusQuery.error),
  };
};

/**
 * A sentence the page can put in front of a reader. This used to hand back the
 * server's whole error body, and `ErrorState` renders what it is given: an
 * object as a React child throws, so a failed ballot read took the page down
 * to the error boundary instead of saying what went wrong. Reachable now that
 * the read is authenticated and can be refused.
 */
const readableError = (error: unknown): string | undefined => {
  if (!error) return undefined;

  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ??
      "We couldn't load this ballot. Please try again."
    );
  }

  return error instanceof Error
    ? error.message
    : "We couldn't load this ballot. Please try again.";
};
