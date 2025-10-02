import { createMatchRequest } from "@repo/shared-types";
import { DuelFormData, LeagueFormData } from "../add-match-schemas";

const isPlayerHome = (nickname: string, homePlayers: string[]): boolean => {
  return homePlayers.includes(nickname);
};

export const transformDuelFormToRequest = (
  data: DuelFormData,
  competitionId: string,
  round?: number,
): createMatchRequest => {
  const duelPlayers = data.matchPlayers.players.map((player) => ({
    nickname: player.nickname,
    goals: player.goals,
    assists: player.assists,
    position: player.position,
    isHome: isPlayerHome(player.nickname, data.players.homePlayers),
  }));

  const safeDate = data.match.date ? new Date(data.match.date) : undefined;
  if (safeDate) {
    safeDate.setHours(12, 0, 0, 0);
  }

  const reqData: createMatchRequest = {
    date: safeDate ? safeDate.toISOString() : undefined,
    homeTeamScore: data.match.homeTeamScore,
    awayTeamScore: data.match.awayTeamScore,
    matchType: data.match.matchType,
    players: duelPlayers,
    competitionId,
    round: round ? round : 1,
    teams: ["Home", "Away"],
    videoUrl: data.match.videoUrl,
  };

  return reqData;
};

export const transformLeagueFormToRequest = (
  data: LeagueFormData,
  competitionId: string,
  round?: number,
): createMatchRequest => {
  const duelPlayers = data.matchPlayers.players.map((player) => ({
    nickname: player.nickname,
    goals: player.goals,
    assists: player.assists,
    position: player.position,
    isHome: isPlayerHome(player.nickname, data.players.homePlayers),
  }));

  const safeDate = data.match.date ? new Date(data.match.date) : undefined;
  if (safeDate) {
    safeDate.setHours(12, 0, 0, 0);
  }

  const reqData: createMatchRequest = {
    date: safeDate ? safeDate.toISOString() : undefined,
    homeTeamScore: data.match.homeTeamScore,
    awayTeamScore: data.match.awayTeamScore,
    matchType: data.match.matchType,
    players: duelPlayers,
    competitionId,
    round: round ? round : 1,
    teams: [data.match.homeTeam, data.match.awayTeam],
    videoUrl: data.match.videoUrl,
  };

  return reqData;
};
