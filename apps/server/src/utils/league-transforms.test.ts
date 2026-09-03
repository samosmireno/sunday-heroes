import { describe, expect, it } from "vitest";
import { TeamCompetitionWithDetails } from "../repositories/team-competition-repo";
import { transformTeamCompetitionToStandingsResponse } from "./league-transforms";
import {
  calculateMatchResult,
  computeStandings,
  StandingsMatch,
  TeamStats,
} from "./standings";

/** A Standings row as the counters hold it, for the team named. */
function counters(
  name: string,
  stats: Partial<
    Pick<
      TeamCompetitionWithDetails,
      "points" | "wins" | "draws" | "losses" | "goalsFor" | "goalsAgainst"
    >
  > = {},
): TeamCompetitionWithDetails {
  const createdAt = new Date("2026-01-01T00:00:00.000Z");
  return {
    id: `tc-${name}`,
    teamId: `team-${name}`,
    competitionId: "comp-1",
    points: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    createdAt,
    ...stats,
    team: { id: `team-${name}`, name, createdAt },
  };
}

describe("transformTeamCompetitionToStandingsResponse", () => {
  it("ranks level teams by name, after points, goal difference and goals for", () => {
    const rows = transformTeamCompetitionToStandingsResponse([
      counters("Wolves", {
        points: 4,
        wins: 1,
        draws: 1,
        goalsFor: 3,
        goalsAgainst: 1,
      }),
      counters("Bears", {
        points: 4,
        wins: 1,
        draws: 1,
        goalsFor: 3,
        goalsAgainst: 1,
      }),
      counters("Lions", {
        points: 4,
        wins: 1,
        draws: 1,
        goalsFor: 4,
        goalsAgainst: 2,
      }),
    ]);

    expect(rows.map((row) => row.name)).toEqual(["Lions", "Bears", "Wolves"]);
  });
});

describe("the counter path and the derived path", () => {
  it("agree on the same Completed matches", () => {
    const names = ["Lions", "Tigers", "Bears", "Wolves"];
    const teamId = (name: string) => `team-${name}`;
    const completed = (
      home: string,
      away: string,
      homeTeamScore: number,
      awayTeamScore: number,
    ): StandingsMatch => ({
      homeTeamId: teamId(home),
      awayTeamId: teamId(away),
      homeTeamScore,
      awayTeamScore,
      isCompleted: true,
    });
    const matches = [
      completed("Lions", "Tigers", 2, 0),
      completed("Bears", "Wolves", 1, 1),
      completed("Lions", "Bears", 0, 3),
      completed("Tigers", "Wolves", 2, 2),
      completed("Wolves", "Lions", 1, 0),
      completed("Tigers", "Bears", 1, 1),
    ];

    // The counter path: completion adds each match's result to the row.
    const increments = new Map<string, Partial<TeamStats>>();
    const add = (name: string, stats: TeamStats) => {
      const current = increments.get(name) ?? {};
      increments.set(name, {
        points: (current.points ?? 0) + stats.points,
        wins: (current.wins ?? 0) + stats.wins,
        draws: (current.draws ?? 0) + stats.draws,
        losses: (current.losses ?? 0) + stats.losses,
        goalsFor: (current.goalsFor ?? 0) + stats.goalsFor,
        goalsAgainst: (current.goalsAgainst ?? 0) + stats.goalsAgainst,
      });
    };
    for (const match of matches) {
      const result = calculateMatchResult(
        match.homeTeamScore,
        match.awayTeamScore,
      );
      add(match.homeTeamId.replace("team-", ""), result.homeTeamStats);
      add(match.awayTeamId.replace("team-", ""), result.awayTeamStats);
    }
    const fromCounters = transformTeamCompetitionToStandingsResponse(
      names.map((name) => counters(name, increments.get(name))),
    );

    const derived = computeStandings(
      names.map((name) => ({ id: teamId(name), name })),
      matches,
    );

    expect(derived).toEqual(fromCounters);
    expect(derived.map((row) => row.name)).toEqual([
      "Bears",
      "Wolves",
      "Lions",
      "Tigers",
    ]);
  });
});
