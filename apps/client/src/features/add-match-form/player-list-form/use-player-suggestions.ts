import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "@/config/config";
import { Team } from "@repo/shared-types";

interface User {
  nickname: string;
}

export function usePlayerSuggestions(
  userId: string | null,
  competitionId: string,
  team: Team,
  searchValue: string,
  selectedPlayers: string[],
) {
  const fetchSuggestions = async (): Promise<string[]> => {
    const response = await axios.get(`${config.server}/api/players/basic`, {
      params: {
        userId,
        competitionId,
        query: searchValue,
      },
    });

    const data = response.data as User[];
    const playerNames = data.map((player) => player.nickname);
    return playerNames.filter((name) => !selectedPlayers.includes(name));
  };

  return useQuery({
    queryKey: [
      "playerSuggestions",
      team,
      searchValue,
      selectedPlayers,
      competitionId,
      userId,
    ],
    queryFn: fetchSuggestions,
    enabled: !!userId && !!competitionId,
    staleTime: 1000 * 60 * 5,
  });
}
