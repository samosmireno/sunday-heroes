import {
  DashboardCompetitionResponse,
  DashboardMatchResponse,
  DashboardResponse,
  DetailedCompetitionResponse,
  VotingStatus,
} from "@repo/shared-types";
import {
  CompetitionWithDetails,
  CompetitionWithMatches,
} from "../repositories/competition/competition-repo";
import { MatchPlayerWithDetails } from "../repositories/match-player-repo";
import { MatchWithTeams } from "../repositories/match-repo";
import { DashboardWithDetails } from "../repositories/dashboard-repo";
import { getUserRole } from "./competition-transforms";

export function transformDashboardToResponse(
  dashboard: DashboardWithDetails
): DashboardResponse {
  const activeCompetitions = dashboard.competitions.length;
  const matches = dashboard.competitions.flatMap((comp) => comp.matches);

  const uniquePlayers = new Set(
    matches.flatMap((match) =>
      match.matchPlayers.map((player) => player.dashboard_player.nickname)
    )
  );
  const totalPlayers = uniquePlayers.size;

  const completedMatches = matches.filter(
    (match) => match.date !== undefined
  ).length;

  const pendingVotes = matches
    .map((match) => {
      if (match.voting_status !== VotingStatus.OPEN) return 0;

      const playerIds = match.matchPlayers.map(
        (player) => player.dashboard_player_id
      );
      const votedPlayerIds = new Set(
        match.player_votes.map((vote) => vote.voter_id)
      );

      return playerIds.filter((id) => !votedPlayerIds.has(id)).length;
    })
    .reduce((total, count) => total + count, 0);

  return {
    id: dashboard.id,
    name: dashboard.name,
    user: dashboard.admin.given_name,
    activeCompetitions,
    totalPlayers,
    pendingVotes,
    completedMatches,
  };
}

export function transformDashboardMatchesToResponse(
  matches: MatchWithTeams[]
): DashboardMatchResponse[] {
  const matchesResponse: DashboardMatchResponse[] = matches.map((match) => ({
    id: match.id,
    competition_type: match.competition
      .type as DashboardMatchResponse["competition_type"],
    competition_name: match.competition.name,
    date: match.date?.toLocaleDateString(),
    match_type: match.match_type as DashboardMatchResponse["match_type"],
    round: match.round,
    home_team_score: match.home_team_score,
    away_team_score: match.away_team_score,
    penalty_home_score: match.penalty_home_score ?? undefined,
    penalty_away_score: match.penalty_away_score ?? undefined,
    teams: match.match_teams.map((matchTeam) => matchTeam.team.name),
    match_players: match.matchPlayers.length,
    voting_status:
      match.voting_status as DashboardMatchResponse["voting_status"],
  }));

  return matchesResponse;
}

export function transformDashboardCompetitionsToResponse(
  comps: CompetitionWithMatches[]
): DashboardCompetitionResponse[] {
  const competitions: DashboardCompetitionResponse[] = comps.map((comp) => ({
    id: comp.id,
    name: comp.name,
    type: comp.type as DashboardCompetitionResponse["type"],
    matches: comp.matches.length,
  }));

  return competitions;
}

const getNumUniquePlayers = (
  matchPlayers: MatchPlayerWithDetails[]
): number => {
  const uniqueNicknames = new Set(
    matchPlayers.map((player) => player.dashboard_player.nickname)
  );
  return uniqueNicknames.size;
};

export function transformDashboardCompetitionsToDetailedResponse(
  userId: string,
  comps: CompetitionWithDetails[]
): DetailedCompetitionResponse[] {
  const competitions: DetailedCompetitionResponse[] = comps.map((comp) => ({
    id: comp.id,
    userRole: getUserRole(comp, userId),
    name: comp.name,
    type: comp.type as DetailedCompetitionResponse["type"],
    teams: comp.team_competitions.length,
    players: getNumUniquePlayers(
      comp.matches.flatMap((match) => match.matchPlayers)
    ),
    matches: comp.matches.length,
    votingEnabled: comp.voting_enabled,
    pendingVotes: comp.voting_enabled ? 0 : undefined,
  }));

  return competitions;
}
