import axios from "axios";
import { useState } from "react";
import { User } from "../../../types/types";
import { Team } from "../../../types/types";
import { config } from "../../../config/config";

export function useTeamPlayers(user_id: string | null) {
  const [players, setPlayers] = useState<{ Home: string[]; Away: string[] }>({
    Home: [],
    Away: [],
  });
  const [suggestions, setSuggestions] = useState<{
    Home: string[];
    Away: string[];
  }>({
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
    setPlayers((prev) => {
      if (!prev[team]) {
        console.error(`${team} team does not exist in players state.`);
        return prev;
      }
      return {
        ...prev,
        [team]: prev[team].filter((p) => p !== player),
      };
    });
  };

  const fetchSuggestions = async (
    team: Team,
    query: string,
    selectedPlayers: string[],
  ) => {
    const response = await axios.get(
      `${config.server}/api/players/basic?userId=${user_id}&query=${query}`,
    );
    const data = response.data as User[];
    const playerNames = data.map((player) => player.nickname);

    const filteredSuggestions = playerNames.filter(
      (name) => !selectedPlayers.includes(name),
    );

    setSuggestions((prev) => ({
      ...prev,
      [team]: filteredSuggestions,
    }));

    return filteredSuggestions;
  };

  return {
    players,
    suggestions,
    addPlayer,
    removePlayer,
    fetchSuggestions,
    setPlayers,
  };
}
