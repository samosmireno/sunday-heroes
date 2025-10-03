import { useState, useCallback } from "react";
import { Team } from "@repo/shared-types";

interface PlayerState {
  Home: string[];
  Away: string[];
}

export function usePlayerManagement() {
  const [players, setPlayers] = useState<PlayerState>({
    Home: [],
    Away: [],
  });

  const addPlayer = useCallback((team: Team, player: string) => {
    const lowerCasePlayer = player.toLowerCase();
    setPlayers((prev) => {
      if (prev[team].some((p) => p.toLowerCase() === lowerCasePlayer)) {
        return prev;
      }
      return {
        ...prev,
        [team]: [...prev[team], player],
      };
    });
  }, []);

  const removePlayer = useCallback((team: Team, player: string) => {
    setPlayers((prev) => ({
      ...prev,
      [team]: prev[team].filter((p) => p !== player),
    }));
  }, []);

  const initializePlayers = useCallback(
    (team: Team, initialPlayers: string[]) => {
      setPlayers((prev) => ({
        ...prev,
        [team]: initialPlayers,
      }));
    },
    [],
  );

  return {
    players,
    addPlayer,
    removePlayer,
    initializePlayers,
    setPlayers,
  };
}
