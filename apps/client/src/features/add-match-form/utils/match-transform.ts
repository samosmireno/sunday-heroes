import { MatchResponse } from "@repo/shared-types";
import { MatchFormData } from "@/features/add-match-form/add-match-schemas";

export const transformResponseToForm = (data: MatchResponse): MatchFormData => {
  return {
    match: {
      date: new Date(data.date || ""),
      homeTeamScore: data.homeTeamScore,
      awayTeamScore: data.awayTeamScore,
      matchType: data.matchType,
      hasPenalties: Boolean(data.penaltyHomeScore),
      penaltyHomeScore: data.penaltyHomeScore || 0,
      penaltyAwayScore: data.penaltyAwayScore || 0,
      homeTeam: data.teams[0],
      awayTeam: data.teams[1],
      videoUrl: data.videoUrl,
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
};
