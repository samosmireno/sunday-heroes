import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/config/axios-config";
import { config } from "@/config/config";
import { useErrorHandler } from "@/hooks/use-error-handler/use-error-handler";
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
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();

  const mutation = useMutation({
    mutationFn: async (data: VoteSubmitData) => {
      return axiosInstance.post(`${config.server}/api/votes`, data);
    },
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error) => {
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

    mutation.mutate({ matchId, voterId, votes });
  };

  const navigateToDashboard = () => navigate("/dashboard");

  return {
    submitVotes,
    isSubmitting: mutation.isPending,
    success,
    navigateToDashboard,
  };
}
