import {
  DashboardCompetitionResponse,
  DashboardMatchResponse,
  DashboardResponse,
  DetailedCompetitionResponse,
} from "@repo/shared-types";
import {
  CompetitionBasic,
  CompetitionWithDetails,
} from "../repositories/competition/competition-repo";
import { MatchPlayerWithDetails } from "../repositories/match-player-repo";
import { getUserRole } from "./competition-transforms";
import { CompetitionMatch } from "../repositories/match-repo";

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
