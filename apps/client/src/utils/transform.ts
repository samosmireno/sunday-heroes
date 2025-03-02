import { AddDuelFormValues, createMatchRequest } from "@repo/logger";

const isPlayerHome = (nickname: string, homePlayers: string[]): boolean => {
  return homePlayers.includes(nickname);
};

export const transformDuelFormToRequest = (
  data: AddDuelFormValues,
  competition_id: string,
  round: number,
): createMatchRequest => {
  const duelPlayers = data.matchPlayers.players.map((player) => ({
    nickname: player.nickname,
    goals: player.goals,
    assists: player.assists,
    position: player.position,
    isHome: isPlayerHome(player.nickname, data.players.homePlayers),
  }));

  const reqData: createMatchRequest = {
    date: data.match.date,
    homeTeamScore: data.match.homeTeamScore,
    awayTeamScore: data.match.awayTeamScore,
    matchType: data.match.matchType,
    players: duelPlayers,
    competitionId: competition_id,
    round: round,
    teams: ["Home", "Away"],
  };

  return reqData;
};
