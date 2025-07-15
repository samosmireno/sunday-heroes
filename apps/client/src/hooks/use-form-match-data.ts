import { useEffect, useState } from "react";
import axiosInstance from "../config/axios-config";
import { MatchResponse } from "@repo/shared-types";
import { MatchFormData } from "../components/features/add-match-form/add-match-schemas";

const transformResponseToForm = (data: MatchResponse): MatchFormData => {
  const formData: MatchFormData = {
    match: {
      date: new Date(data.date || ""),
      homeTeamScore: data.homeTeamScore,
      awayTeamScore: data.awayTeamScore,
      matchType: data.matchType,
      hasPenalties: data.penaltyHomeScore ? true : false,
      penaltyHomeScore: data.penaltyHomeScore,
      penaltyAwayScore: data.penaltyAwayScore,
      homeTeam: data.teams[0],
      awayTeam: data.teams[1],
    },
    players: {
      homePlayers: data.players
        .filter((player) => player.isHome)
        .map((player) => player.nickname),
      awayPlayers: data.players
        .filter((player) => !player.isHome)
        .map((player) => player.nickname),
    },
    matchPlayers: {
      players: data.players.map((player) => ({
        position: player.position,
        nickname: player.nickname,
        goals: player.goals,
        assists: player.assists,
      })),
    },
  };

  return formData;
};

export const useFormMatchData = (matchId: string | undefined) => {
  const [formData, setFormData] = useState<MatchFormData | null>(null);

  useEffect(() => {
    if (matchId) {
      axiosInstance
        .get(`/api/matches/${matchId}`)
        .then((response) => {
          const data: MatchResponse = response.data;

          setFormData(transformResponseToForm(data));
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [matchId]);

  return {
    formData,
  };
};
