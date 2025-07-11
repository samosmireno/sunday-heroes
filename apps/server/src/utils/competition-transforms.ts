import {
  CompetitionResponse,
  MatchResponse,
  PlayerTotals,
  Role,
} from "@repo/shared-types";
import { CompetitionWithDetails } from "../repositories/competition/competition-repo";
import { Competition } from "@prisma/client";
import { calculatePlayerScore, calculatePlayerStats } from "./utils";
import { createCompetitionRequest } from "../schemas/create-competition-request-schema";

export function getUserRole(
  competition: CompetitionWithDetails,
  userId: string
): Role {
  if (competition.dashboard.admin_id === userId) {
    return Role.ADMIN;
  }

  const moderator = competition.moderators.find(
    (mod) => mod.dashboard_player.user_id === userId
  );

  if (moderator) {
    return Role.MODERATOR;
  }

  return Role.PLAYER;
}

export function transformCompetitionToResponse(
  competition: CompetitionWithDetails,
  userId: string
): CompetitionResponse {
  const matches: MatchResponse[] = competition.matches.map((match) => ({
    id: match.id,
    date: match.date?.toLocaleDateString(),
    match_type: match.match_type as MatchResponse["match_type"],
    round: match.round,
    home_team_score: match.home_team_score,
    away_team_score: match.away_team_score,
    penalty_home_score: match.penalty_home_score ?? undefined,
    penalty_away_score: match.penalty_away_score ?? undefined,
    teams: match.match_teams.map((matchTeam) => matchTeam.team.name),
    is_completed: match.is_completed,
    players: match.matchPlayers.map((player) => {
      return {
        id: player.id,
        nickname: player.dashboard_player.nickname,
        isHome: player.is_home,
        goals: player.goals,
        assists: player.assists,
        position: player.position,
        penalty_scored: player.penalty_scored ?? undefined,
        rating: calculatePlayerScore(player.received_votes, match.player_votes),
      };
    }),
  }));

  const playerStats: PlayerTotals[] = calculatePlayerStats(matches);

  const teams = competition.team_competitions.map((teamComp) => ({
    id: teamComp.team.id,
    name: teamComp.team.name,
  }));

  return {
    id: competition.id,
    name: competition.name,
    type: competition.type as CompetitionResponse["type"],
    userRole: getUserRole(competition, userId),
    votingEnabled: competition.voting_enabled,
    teams: teams.length > 0 ? teams : undefined,
    matches: matches,
    player_stats: playerStats,
    moderators: competition.moderators.map((moderator) => ({
      id: moderator.id,
      nickname: moderator.dashboard_player.nickname,
    })),
  };
}

export function transformAddCompetitionRequestToService(
  competitionReq: createCompetitionRequest,
  dashboardId: string
): Omit<Competition, "id"> {
  const competition: Omit<Competition, "id"> = {
    dashboard_id: dashboardId,
    name: competitionReq.name,
    type: competitionReq.type,
    created_at: new Date(Date.now()),
    track_seasons: competitionReq.track_seasons,
    current_season: competitionReq.current_season ?? 1,
    voting_enabled: competitionReq.voting_enabled,
    voting_period_days: competitionReq.voting_period_days ?? null,
    knockout_voting_period_days:
      competitionReq.knockout_voting_period_days ?? null,
    reminder_days: competitionReq.reminder_days ?? null,
    min_players: competitionReq.min_players ?? 4,
    is_round_robin: null,
  };

  return competition;
}
