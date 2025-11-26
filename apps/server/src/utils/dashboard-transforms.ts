import {
  DashboardCompetitionResponse,
  DashboardMatchResponse,
  DashboardResponse,
  DetailedCompetitionResponse,
} from "@repo/shared-types";
import { CompetitionBasic } from "../repositories/competition/competition-repo";
import { CompetitionMatch } from "../repositories/match-repo";
import { CompetitionListSelect } from "../repositories/competition/competition-query-repo";
import { Role } from "@prisma/client";

export function transformDashboardCompetitionsToDetailedResponse(
  matchCounts: {
    [k: string]: number;
  },
  teamCounts: {
    [k: string]: number;
  },
  playerCounts: Record<string, number>,
  userRoles: Record<string, Role>,
  comps: CompetitionListSelect[]
): DetailedCompetitionResponse[] {
  const competitions = comps.map((comp) => ({
    id: comp.id,
    name: comp.name,
    type: comp.type as DetailedCompetitionResponse["type"],
    userRole: userRoles[comp.id] as DetailedCompetitionResponse["userRole"],
    matches: matchCounts[comp.id] ?? 0,
    teams: teamCounts[comp.id] ?? 0,
    players: playerCounts[comp.id] ?? 0,
    votingEnabled: comp.votingEnabled,
    pendingVotes: comp.votingEnabled ? 0 : undefined,
  }));

  return competitions;
}

export function extractDashboardData(
  competitions: CompetitionBasic[],
  matches: CompetitionMatch[]
): DashboardResponse {
  const activeCompetitions = competitions.length;

  const completedMatches = matches.filter((m) => m.date !== null).length;

  const uniquePlayers = new Set(
    matches.flatMap((m) => m.matchPlayers.map((mp) => mp.dashboardPlayerId))
  );

  const totalPlayers = uniquePlayers.size;

  const pendingVotes = matches.reduce((sum, match) => {
    if (match.votingStatus !== "OPEN") return sum;

    const playerIds = match.matchPlayers.map((mp) => mp.dashboardPlayerId);
    const votedIds = new Set(match.playerVotes.map((v) => v.voterId));

    const pending = playerIds.filter((id) => !votedIds.has(id)).length;

    return sum + pending;
  }, 0);

  const dashboardMatches = transformDashboardMatchesToResponse(matches);
  const dashboardCompetitions = transformDashboardCompetitionsToResponse(
    competitions,
    matches
  );

  return {
    activeCompetitions,
    totalPlayers,
    pendingVotes,
    completedMatches,
    matches: dashboardMatches,
    competitions: dashboardCompetitions,
  };
}

function transformDashboardMatchesToResponse(
  matches: CompetitionMatch[]
): DashboardMatchResponse[] {
  return matches
    .filter((m) => m.date !== null)
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
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
      teams: match.matchTeams.map((mt) => mt.team.name),
      matchPlayers: match.matchPlayers.length,
      votingStatus:
        match.votingStatus as DashboardMatchResponse["votingStatus"],
    }));
}

function transformDashboardCompetitionsToResponse(
  comps: CompetitionBasic[],
  matches: CompetitionMatch[]
): DashboardCompetitionResponse[] {
  const grouped = new Map<string, number>();

  for (const match of matches) {
    grouped.set(
      match.competition.id,
      (grouped.get(match.competition.id) ?? 0) + 1
    );
  }

  return comps.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type as DashboardCompetitionResponse["type"],
    matches: grouped.get(c.id) ?? 0,
  }));
}
