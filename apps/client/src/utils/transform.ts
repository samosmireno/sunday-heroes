import { createMatchRequest } from "@repo/shared-types";
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
    trackSeasons: data.trackSeasons,
    votingEnabled: data.votingEnabled,
    currentSeason: 1,
    minPlayers: 4,
    votingPeriodDays: data.votingPeriodDays ?? undefined,
    knockoutVotingPeriodDays: data.knockoutVotingPeriodDays ?? undefined,
    reminderDays: data.reminderDays ?? undefined,
    isRoundRobin: data.isRoundRobin ?? false,
    numberOfTeams: data.numberOfTeams ?? undefined,
    matchType: data.matchType ?? undefined,
  };

  return competitionRequest;
};
