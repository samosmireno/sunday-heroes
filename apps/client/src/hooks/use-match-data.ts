import { useEffect, useState } from "react";
import axiosInstance from "../config/axiosConfig";
import { AddDuelFormValues, MatchResponse } from "@repo/logger";

const transformResponseToForm = (data: MatchResponse): AddDuelFormValues => {
  const formData: AddDuelFormValues = {
    match: {
      date: new Date(data.date),
      homeTeamScore: data.home_team_score,
      awayTeamScore: data.away_team_score,
      matchType: data.match_type,
      hasPenalties: data.penalty_home_score ? true : false,
      penaltyHomeScore: data.penalty_home_score,
      penaltyAwayScore: data.penalty_away_score,
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

export const useMatchData = (matchId: string | undefined) => {
  const [formData, setFormData] = useState<AddDuelFormValues | null>(null);

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
