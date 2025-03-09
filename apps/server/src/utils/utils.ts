import { MatchWithDetails, MatchWithTeams } from "../repositories/match-repo";
import { map, z } from "zod";
import {
  CompetitionResponse,
  createMatchRequest,
  DashboardCompetitionResponse,
  DashboardMatchResponse,
  DashboardResponse,
  DuelPlayerRequest,
  MatchResponse,
  PlayerResponse,
  VotingStatus,
} from "@repo/logger";
import { Competition, Match, MatchPlayer, MatchType } from "@prisma/client";
import { DashboardWithDetails } from "../repositories/dashboard-repo";
import { CompetitionWithMatches } from "../repositories/competition-repo";

export function createStepSchema<T extends Record<string, z.ZodType>>(
  steps: T
) {
  return z.object(steps);
}

function sortPlayersHomeAwayByPosition(
  players: PlayerResponse[]
): PlayerResponse[] {
  const homePlayers = players
    .filter((player) => player.isHome === true)
    .sort((a, b) => a.position - b.position);
  const awayPlayers = players
    .filter((player) => player.isHome !== true)
    .sort((a, b) => a.position - b.position);

  return [...homePlayers, ...awayPlayers];
}

export function transformMatchServiceToResponse(
  data: MatchWithDetails
): MatchResponse {
  const mappedPlayers = data.matchPlayers.map((player) => ({
    id: player.id,
    nickname: player.player.nickname,
    isHome: player.is_home,
    goals: player.goals,
    assists: player.assists,
    position: player.position,
  }));

  const sortedPlayers = sortPlayersHomeAwayByPosition(mappedPlayers);

  const transformedData: MatchResponse = {
    id: data.id,
    date: data.date.toLocaleDateString(),
    match_type: data.match_type as MatchResponse["match_type"],
    round: data.round,
    home_team_score: data.home_team_score,
    away_team_score: data.away_team_score,
    penalty_home_score: data.penalty_home_score ?? undefined,
    penalty_away_score: data.penalty_away_score ?? undefined,
    teams: data.match_teams.map((matchTeam) => matchTeam.team.name),
    players: sortedPlayers,
  };

  return transformedData;
}

export function transformAddMatchRequestToService(
  data: createMatchRequest
): Omit<Match, "id"> {
  const matchForService: Omit<Match, "id"> = {
    competition_id: data.competitionId,
    match_type: data.matchType,
    date: data.date,
    home_team_score: data.homeTeamScore,
    away_team_score: data.awayTeamScore,
    penalty_home_score: data.penaltyHomeScore ?? null,
    penalty_away_score: data.penaltyHomeScore ?? null,
    created_at: new Date(Date.now()),
    round: data.round,
    bracket_position: data.bracketPosition ?? null,
    voting_status: VotingStatus.OPEN,
    voting_ends_at: new Date(Date.now() + 5 * 24 * 60 * 60),
    is_completed: false,
  };

  return matchForService;
}

export function transformAddMatchRequestToMatchPlayer(
  data: DuelPlayerRequest,
  match_id: string,
  player_id: string,
  team_id: string
): Omit<MatchPlayer, "id"> {
  const matchPlayerForService: Omit<MatchPlayer, "id"> = {
    created_at: new Date(Date.now()),
    match_id: match_id,
    player_id: player_id,
    team_id: team_id,
    is_home: data.isHome,
    goals: data.goals,
    assists: data.assists,
    position: data.position,
    penalty_scored: data.penaltyScored ?? null,
  };

  return matchPlayerForService;
}

export function transformDashboardServiceToResponse(
  data: DashboardWithDetails
): DashboardResponse {
  const mappedCompetitions: CompetitionResponse[] = data.competitions.map(
    (comp) => {
      const mappedMatches: MatchResponse[] = comp.matches.map((match) => {
        const matchPlayers = match.matchPlayers.map((player) => ({
          id: player.id,
          nickname: player.player.nickname,
          isHome: player.is_home,
          goals: player.goals,
          assists: player.assists,
          position: player.position,
          penalty_scored: player.penalty_scored ?? undefined,
          votes: player.player.votes_given.map((vote) => vote.points),
        }));

        return {
          id: match.id,
          date: match.date.toLocaleDateString(),
          match_type: match.match_type as MatchResponse["match_type"],
          round: match.round,
          home_team_score: match.home_team_score,
          away_team_score: match.away_team_score,
          penalty_home_score: match.penalty_home_score ?? undefined,
          penalty_away_score: match.penalty_away_score ?? undefined,
          teams: match.match_teams.map((matchTeam) => matchTeam.team.name),
          players: matchPlayers,
        };
      });

      return {
        id: comp.id,
        name: comp.name,
        type: comp.type as CompetitionResponse["type"],
        matches: mappedMatches,
      };
    }
  );

  return {
    id: data.id,
    name: data.name,
    user: data.admin.nickname,
    competitions: mappedCompetitions,
  };
}

export function transformDashboardMatchesToResponse(
  data: MatchWithTeams[]
): DashboardMatchResponse[] {
  const matchesResponse: DashboardMatchResponse[] = data.map((match) => ({
    id: match.id,
    competition_type: match.competition
      .type as DashboardMatchResponse["competition_type"],
    competition_name: match.competition.name,
    date: match.date.toLocaleDateString(),
    match_type: match.match_type as DashboardMatchResponse["match_type"],
    round: match.round,
    home_team_score: match.home_team_score,
    away_team_score: match.away_team_score,
    penalty_home_score: match.penalty_home_score ?? undefined,
    penalty_away_score: match.penalty_away_score ?? undefined,
    teams: match.match_teams.map((matchTeam) => matchTeam.team.name),
  }));

  return matchesResponse;
}

export function transformDashboardCompetitionsToResponse(
  data: CompetitionWithMatches[]
): DashboardCompetitionResponse[] {
  const competitions: DashboardCompetitionResponse[] = data.map((comp) => ({
    id: comp.id,
    name: comp.name,
    type: comp.type as DashboardCompetitionResponse["type"],
    matches: comp.matches.length,
  }));

  return competitions;
}
