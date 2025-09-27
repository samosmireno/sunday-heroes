import {
  DashboardCompetitionResponse,
  DashboardMatchResponse,
  DashboardResponse,
  DetailedCompetitionResponse,
  VotingStatus,
} from "@repo/shared-types";
import { CompetitionWithDetails } from "../repositories/competition/competition-repo";
import { MatchPlayerWithDetails } from "../repositories/match-player-repo";
import {
  DashboardMatchesType,
  DashboardWithDetails,
} from "../repositories/dashboard-repo";
import { getUserRole } from "./competition-transforms";
import {
  DashboardCompetitionsType,
  DashboardPlayerWithDashboardData,
} from "../repositories/dashboard-player-repo";

export function extractDashboardData(
  dashboardPlayers: DashboardPlayerWithDashboardData[]
): DashboardResponse {
  const competitions = dashboardPlayers.flatMap(
    (dp) => dp.dashboard.competitions
  );

  const dashboardData = extractDashboardOwnerData(competitions);

  return {
    activeCompetitions: dashboardData.activeCompetitions,
    totalPlayers: dashboardData.totalPlayers,
    pendingVotes: dashboardData.pendingVotes,
    completedMatches: dashboardData.completedMatches,
    matches: dashboardData.dashboardMatches,
    competitions: dashboardData.dashboardCompetitions,
  };
}

export function transformDashboardToResponse(
  dashboard: DashboardWithDetails
): DashboardResponse {
  const dashboardOwnerData = extractDashboardOwnerData(dashboard.competitions);

  return {
    activeCompetitions: dashboardOwnerData.activeCompetitions,
    totalPlayers: dashboardOwnerData.totalPlayers,
    pendingVotes: dashboardOwnerData.pendingVotes,
    completedMatches: dashboardOwnerData.completedMatches,
    matches: dashboardOwnerData.dashboardMatches,
    competitions: dashboardOwnerData.dashboardCompetitions,
  };
}

function extractDashboardOwnerData(competitions: DashboardCompetitionsType) {
  const activeCompetitions = competitions.length;
  const matches = competitions.flatMap((comp) => comp.matches);

  const uniquePlayers = new Set(
    matches.flatMap((match) =>
      match.matchPlayers.map((player) => player.dashboardPlayer.id)
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

  const dashboardMatches = transformDashboardMatchesToResponse(matches);
  const dashboardCompetitions =
    transformDashboardCompetitionsToResponse(competitions);

  return {
    activeCompetitions,
    totalPlayers,
    pendingVotes,
    completedMatches,
    dashboardMatches,
    dashboardCompetitions,
  };
}

function transformDashboardMatchesToResponse(
  matches: DashboardMatchesType
): DashboardMatchResponse[] {
  const matchesResponse: DashboardMatchResponse[] = matches
    .filter((match) => match.date !== null)
    .sort((a, b) => {
      const aTime = a.date instanceof Date ? a.date.getTime() : 0;
      const bTime = b.date instanceof Date ? b.date.getTime() : 0;
      return bTime - aTime;
    })
    .map((match) => ({
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
      votingStatus:
        match.votingStatus as DashboardMatchResponse["votingStatus"],
    }));

  return matchesResponse;
}

function transformDashboardCompetitionsToResponse(
  comps: DashboardCompetitionsType
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
