import { useState } from "react";
import { findFirstRankMissing } from "@/features/voting/utils";
import { config } from "@/config/config";

interface SelectedPlayer {
  id: string;
  rank: number;
}

export function usePlayerSelection(
  maxSelections = config.voting.maxVotesPerPlayer,
) {
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayers((prev) => {
      const playerNames = prev.map((p) => p.id);

      if (playerNames.includes(playerId)) {
        return prev.filter((p) => p.id !== playerId);
      }

      if (prev.length >= maxSelections) {
        return prev;
      }

      const rank = findFirstRankMissing(prev.map((p) => p.rank));
      if (rank === -1) return prev;

      return [...prev, { id: playerId, rank }];
    });
  };

  const canSubmit = selectedPlayers.length === maxSelections;
  const isComplete = selectedPlayers.length === maxSelections;

  return {
    selectedPlayers,
    handlePlayerSelect,
    canSubmit,
    isComplete,
  };
}
