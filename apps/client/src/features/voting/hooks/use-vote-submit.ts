import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance, { isSessionExpired } from "@/config/axios-config";
import { config } from "@/config/config";
import { useAuth } from "@/context/auth-context";
import { clearVoteDraft } from "@/features/voting/vote-draft";
import {
  httpStatus,
  useErrorHandler,
} from "@/hooks/use-error-handler/use-error-handler";
import { AppError } from "@/hooks/use-error-handler/types";

interface VoteSubmitData {
  matchId: string;
  voterId: string;
  votes: Array<{
    playerId: string;
    points: number;
  }>;
}

export function useVoteSubmit() {
  const [success, setSuccess] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { handleError } = useErrorHandler();

  /** This ballot, query string and all: where signing in has to put them back. */
  const ballotPath = location.pathname + location.search;

  const mutation = useMutation({
    mutationFn: async (data: VoteSubmitData) => {
      return axiosInstance.post(`${config.server}/api/votes`, data);
    },
    onSuccess: (_response, data) => {
      // Recorded on the server, so there is no longer a vote to finish.
      clearVoteDraft(data.matchId, data.voterId);
      setSuccess(true);
    },
    onError: (error) => {
      /**
       * A vote lost to a dead session is the failure this page exists to stop
       * repeating, so it is answered here rather than by `useErrorHandler`.
       * The handler's answer to a lost session is to sign the player out and
       * navigate away — which unmounts the ballot mid-vote and tells them
       * nothing about what became of it. A player who has just pressed Submit
       * has to hear that their vote was not submitted, and be handed the way
       * to finish it.
       */
      if (isSessionExpired(error) || httpStatus(error as AppError) === 401) {
        setSessionExpired(true);
        return;
      }

      handleError(error as AppError, {
        showToast: true,
        logError: true,
        throwError: false,
      });
    },
  });

  const submitVotes = (
    matchId: string,
    voterId: string,
    selectedPlayers: Array<{ id: string; rank: number }>,
  ) => {
    if (!matchId || !voterId || selectedPlayers.length !== 3) return;

    const votes = selectedPlayers.map((p) => ({
      playerId: p.id,
      points: p.rank,
    }));

    setSessionExpired(false);
    mutation.mutate({ matchId, voterId, votes });
  };

  /**
   * Sign in, then come back here. `login` records the return path, the OAuth
   * callback reads it, and the picks are waiting in the draft — so the vote
   * costs one more click rather than the whole ballot again.
   */
  const signInToSubmit = () => login(ballotPath);

  const navigateToDashboard = () => navigate("/dashboard");

  return {
    submitVotes,
    isSubmitting: mutation.isPending,
    success,
    sessionExpired,
    signInToSubmit,
    navigateToDashboard,
  };
}
