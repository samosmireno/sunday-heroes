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
      match.matchPlayers.map((player) => player.dashboardPlayer.nickname)
    )
  );
  const totalPlayers = uniquePlayers.size;

  const completedMatches = matches.filter(
    (match) => match.date !== null
  ).length;

  const pendingVotes = matches
    .map((match) => {
      if (match.votingStatus !== VotingStatus.OPEN) return 0;

      const playerIds = match.matchPlayers.map(
        (player) => player.dashboardPlayerId
      );
      const votedPlayerIds = new Set(
        match.playerVotes.map((vote) => vote.voterId)
      );

      return playerIds.filter((id) => !votedPlayerIds.has(id)).length;
    })
    .reduce((total, count) => total + count, 0);

  return {
    id: dashboard.id,
    name: dashboard.name,
    user: dashboard.admin.givenName,
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
    competitionType: match.competition
      .type as DashboardMatchResponse["competitionType"],
    competitionName: match.competition.name,
    date: match.date?.toLocaleDateString(),
    matchType: match.matchType as DashboardMatchResponse["matchType"],
    round: match.round,
    homeTeamScore: match.homeTeamScore,
    awayTeamScore: match.awayTeamScore,
    penaltyHomeScore: match.penaltyHomeScore ?? undefined,
    penaltyAwayScore: match.penaltyAwayScore ?? undefined,
    teams: match.matchTeams.map((matchTeam) => matchTeam.team.name),
    matchPlayers: match.matchPlayers.length,
    votingStatus: match.votingStatus as DashboardMatchResponse["votingStatus"],
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
    matchPlayers.map((player) => player.dashboardPlayer.nickname)
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
    teams: comp.teamCompetitions.length,
    players: getNumUniquePlayers(
      comp.matches.flatMap((match) => match.matchPlayers)
    ),
    matches: comp.matches.length,
    votingEnabled: comp.votingEnabled,
    pendingVotes: comp.votingEnabled ? 0 : undefined,
  }));

  return competitions;
}
