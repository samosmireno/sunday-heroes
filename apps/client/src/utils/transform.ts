import {
  AddDuelFormValues,
  createCompetitionRequest,
  createMatchRequest,
} from "@repo/logger";
import { CreateCompetitionFormValues } from "../components/features/add-competition-form/schema";

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

export const transformCompetitionFormToRequest = (
  data: CreateCompetitionFormValues,
  userId: string,
): createCompetitionRequest => {
  const competitionRequest: createCompetitionRequest = {
    userId: userId,
    type: data.type,
    name: data.name,
    track_seasons: data.track_seasons,
    voting_enabled: data.voting_enabled,
    current_season: 1,
    min_players: 4,
    voting_period_days: data.voting_period_days ?? undefined,
    knockout_voting_period_days: data.knockout_voting_period_days ?? undefined,
    reminder_days: data.reminder_days ?? undefined,
  };

  return competitionRequest;
};
