import { createMatchRequest } from "@repo/logger";
import { CreateCompetitionFormValues } from "../components/features/create-competition-form/create-competition-schema";
import {
  DuelFormData,
  LeagueFormData,
} from "../components/features/add-match-form/add-match-schemas";

const isPlayerHome = (nickname: string, homePlayers: string[]): boolean => {
  return homePlayers.includes(nickname);
};

export const transformDuelFormToRequest = (
  data: DuelFormData,
  competition_id: string,
  round?: number,
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
    round: round ? round : 1,
    teams: ["Home", "Away"],
  };

  return reqData;
};

export const transformLeagueFormToRequest = (
  data: LeagueFormData,
  competition_id: string,
  round?: number,
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
    round: round ? round : 1,
    teams: [data.match.homeTeam, data.match.awayTeam],
  };

  return reqData;
};

export const transformCompetitionFormToRequest = (
  data: CreateCompetitionFormValues,
  userId: string,
) => {
  const competitionRequest = {
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
    is_round_robin: data.is_round_robin ?? false,
    number_of_teams: data.number_of_teams ?? undefined,
    match_type: data.match_type ?? undefined,
  };

  return competitionRequest;
};
