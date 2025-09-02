import axios from "axios";
import { useState } from "react";
import { User, Team } from "../../../types/types";
import { config } from "../../../config/config";

export function useTeamPlayers(user_id: string | null, competitionId: string) {
  const [players, setPlayers] = useState<{ Home: string[]; Away: string[] }>({
    Home: [],
    Away: [],
  });

  const addPlayer = (team: Team, player: string) => {
    const lowerCasePlayer = player.toLowerCase();
    if (!players[team].some((p) => p.toLowerCase() === lowerCasePlayer)) {
      setPlayers((prev) => ({
        ...prev,
        [team]: [...prev[team], player],
      }));
    }
  };

  const removePlayer = (team: Team, player: string) => {
    setPlayers((prev) => ({
      ...prev,
      [team]: prev[team].filter((p) => p !== player),
    }));
  };

  const fetchSuggestions = async (
    query: string,
    selectedPlayers: string[],
  ): Promise<string[]> => {
    const response = await axios.get(`${config.server}/api/players/basic`, {
      params: {
        userId: user_id,
        competitionId,
        query,
      },
    });
    const data = response.data as User[];
    const playerNames = data.map((player) => player.nickname);
    return playerNames.filter((name) => !selectedPlayers.includes(name));
  };

  return {
    players,
    addPlayer,
    removePlayer,
    fetchSuggestions,
    setPlayers,
  };
}
