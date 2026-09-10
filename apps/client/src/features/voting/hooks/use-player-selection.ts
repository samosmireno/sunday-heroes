import { useEffect, useState } from "react";
import { findFirstRankMissing } from "@/features/voting/utils";
import { readVoteDraft, writeVoteDraft } from "@/features/voting/vote-draft";
import { config } from "@/config/config";

interface SelectedPlayer {
  id: string;
  rank: number;
}

/**
 * The picks on one ballot, kept in `sessionStorage` as well as in state. The
 * ballot is identified by the match and the voter, so a player carrying two
 * ballots does not have one overwrite the other, and coming back to a ballot —
 * after signing in again, after a reload — comes back to the picks.
 */
export function usePlayerSelection(
  { matchId, voterId }: { matchId: string; voterId: string },
  maxSelections = config.voting.maxVotesPerPlayer,
) {
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>(() =>
    readVoteDraft(matchId, voterId).slice(0, maxSelections),
  );

  useEffect(() => {
    writeVoteDraft(matchId, voterId, selectedPlayers);
  }, [matchId, voterId, selectedPlayers]);

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
