/**
 * Standings arithmetic shared by the two ways Standings are produced: the
 * live counters on `TeamCompetition` for the Current season, and the table
 * derived from a selection's Completed matches for a Past season or All
 * seasons (ADR 0003). One result rule and one sort, so the two cannot drift.
 */
import { LeagueTeamResponse } from "@repo/shared-types";

/** The counters a Match adds to a team's Standings row. */
export interface TeamStats {
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

/** A team as the Standings show it: its current name. */
export type StandingsTeam = { id: string; name: string };

/** What a Match contributes to a derived table. Only a Completed match counts. */
export interface StandingsMatch {
  homeTeamId: string;
  awayTeamId: string;
  homeTeamScore: number;
  awayTeamScore: number;
  isCompleted: boolean;
}

const ZERO: TeamStats = {
  points: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
};

function addStats(a: TeamStats, b: TeamStats): TeamStats {
  return {
    points: a.points + b.points,
    wins: a.wins + b.wins,
    draws: a.draws + b.draws,
    losses: a.losses + b.losses,
    goalsFor: a.goalsFor + b.goalsFor,
    goalsAgainst: a.goalsAgainst + b.goalsAgainst,
  };
}

/** The standings response row for a team and its counters, whichever path produced them. */
export function standingsRow(
  team: StandingsTeam,
  stats: TeamStats,
): LeagueTeamResponse {
  return {
    id: team.id,
    name: team.name,
    points: stats.points,
    wins: stats.wins,
    draws: stats.draws,
    losses: stats.losses,
    goalsFor: stats.goalsFor,
    goalsAgainst: stats.goalsAgainst,
    goalDifference: stats.goalsFor - stats.goalsAgainst,
    played: stats.wins + stats.draws + stats.losses,
    team: { id: team.id, name: team.name },
  };
}

/**
 * The Standings a set of matches supports: every team given appears, at zero
 * when none of the matches is its; a Fixture that is not a Completed match is
 * left out whatever score it holds. A match between teams outside the set
 * counts for nobody: the row set is the Competition's teams, not the matches'.
 */
export function computeStandings(
  teams: StandingsTeam[],
  matches: StandingsMatch[],
): LeagueTeamResponse[] {
  const statsByTeam = new Map(teams.map((team) => [team.id, ZERO]));
  const add = (teamId: string, stats: TeamStats) => {
    const current = statsByTeam.get(teamId);
    if (current) statsByTeam.set(teamId, addStats(current, stats));
  };

  for (const match of matches) {
    if (!match.isCompleted) continue;
    const { homeTeamStats, awayTeamStats } = calculateMatchResult(
      match.homeTeamScore,
      match.awayTeamScore,
    );
    add(match.homeTeamId, homeTeamStats);
    add(match.awayTeamId, awayTeamStats);
  }

  return teams
    .map((team) => standingsRow(team, statsByTeam.get(team.id) ?? ZERO))
    .sort(compareStandings);
}

/** What the sort reads off a Standings row. */
export type StandingsRank = {
  name: string;
  points: number;
  goalDifference: number;
  goalsFor: number;
};

/**
 * The one Standings order: points, then goal difference, then goals for, all
 * descending, then team name ascending so level teams sit in a stable order.
 */
export function compareStandings(a: StandingsRank, b: StandingsRank): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference)
    return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.name.localeCompare(b.name);
}

/** A win is 3 points, a draw 1, a loss 0; the goals count both ways. */
export function calculateMatchResult(
  homeScore: number,
  awayScore: number,
): { homeTeamStats: TeamStats; awayTeamStats: TeamStats } {
  let homePoints = 0,
    awayPoints = 0;
  let homeWins = 0,
    homeDraws = 0,
    homeLosses = 0;
  let awayWins = 0,
    awayDraws = 0,
    awayLosses = 0;

  if (homeScore > awayScore) {
    homePoints = 3;
    homeWins = 1;
    awayLosses = 1;
  } else if (homeScore < awayScore) {
    awayPoints = 3;
    awayWins = 1;
    homeLosses = 1;
  } else {
    homePoints = awayPoints = 1;
    homeDraws = awayDraws = 1;
  }

  return {
    homeTeamStats: {
      points: homePoints,
      wins: homeWins,
      draws: homeDraws,
      losses: homeLosses,
      goalsFor: homeScore,
      goalsAgainst: awayScore,
    },
    awayTeamStats: {
      points: awayPoints,
      wins: awayWins,
      draws: awayDraws,
      losses: awayLosses,
      goalsFor: awayScore,
      goalsAgainst: homeScore,
    },
  };
}
