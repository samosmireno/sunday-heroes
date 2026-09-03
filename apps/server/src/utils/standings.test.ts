import { describe, expect, it } from "vitest";
import {
  calculateMatchResult,
  compareStandings,
  computeStandings,
  StandingsMatch,
} from "./standings";

const lions = { id: "team-lions", name: "Lions" };
const bears = { id: "team-bears", name: "Bears" };
const wolves = { id: "team-wolves", name: "Wolves" };
const teams = [lions, bears, wolves];

function match(
  home: { id: string },
  away: { id: string },
  homeTeamScore: number,
  awayTeamScore: number,
  isCompleted = true,
): StandingsMatch {
  return {
    homeTeamId: home.id,
    awayTeamId: away.id,
    homeTeamScore,
    awayTeamScore,
    isCompleted,
  };
}

/** A row at zero, as a team with no Completed match in the selection shows. */
function zeroRow(team: { id: string; name: string }) {
  return {
    id: team.id,
    name: team.name,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    goalDifference: 0,
    team: { id: team.id, name: team.name },
  };
}

describe("computeStandings", () => {
  it("with no matches shows every team at zero in name order", () => {
    expect(computeStandings(teams, [])).toEqual([
      zeroRow(bears),
      zeroRow(lions),
      zeroRow(wolves),
    ]);
  });

  it("keeps a team with no Match in the selection in the table at zero", () => {
    const rows = computeStandings(teams, [match(lions, bears, 2, 0)]);

    expect(rows).toEqual([
      {
        id: lions.id,
        name: "Lions",
        played: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 2,
        goalsAgainst: 0,
        points: 3,
        goalDifference: 2,
        team: lions,
      },
      zeroRow(wolves),
      {
        id: bears.id,
        name: "Bears",
        played: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 2,
        points: 0,
        goalDifference: -2,
        team: bears,
      },
    ]);
  });

  it("excludes a not-completed Fixture even when a score was entered", () => {
    const rows = computeStandings(teams, [
      match(lions, bears, 2, 0),
      match(bears, wolves, 5, 0, false),
    ]);

    expect(rows.map((row) => [row.name, row.played, row.points])).toEqual([
      ["Lions", 1, 3],
      ["Wolves", 0, 0],
      ["Bears", 1, 0],
    ]);
  });

  it("counts played as wins plus draws plus losses", () => {
    const rows = computeStandings(teams, [
      match(lions, bears, 2, 0),
      match(wolves, lions, 1, 1),
      match(bears, lions, 1, 0),
    ]);

    expect(rows[0]).toEqual({
      id: lions.id,
      name: "Lions",
      played: 3,
      wins: 1,
      draws: 1,
      losses: 1,
      goalsFor: 3,
      goalsAgainst: 2,
      points: 4,
      goalDifference: 1,
      team: lions,
    });
  });
});

describe("compareStandings", () => {
  it("ranks by points, then goal difference, then goals for, then team name ascending", () => {
    const rows = [
      { name: "Wolves", points: 6, goalDifference: 2, goalsFor: 5 },
      { name: "Bears", points: 6, goalDifference: 2, goalsFor: 5 },
      { name: "Tigers", points: 6, goalDifference: 2, goalsFor: 7 },
      { name: "Lions", points: 6, goalDifference: 4, goalsFor: 4 },
      { name: "Eagles", points: 7, goalDifference: -1, goalsFor: 1 },
    ];

    expect([...rows].sort(compareStandings).map((row) => row.name)).toEqual([
      "Eagles",
      "Lions",
      "Tigers",
      "Bears",
      "Wolves",
    ]);
  });
});

describe("calculateMatchResult", () => {
  it("gives a home win 3 points and the loss to the away team, with the goals both ways", () => {
    expect(calculateMatchResult(2, 0)).toEqual({
      homeTeamStats: {
        points: 3,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 2,
        goalsAgainst: 0,
      },
      awayTeamStats: {
        points: 0,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 2,
      },
    });
  });

  it("gives an away win 3 points and the loss to the home team", () => {
    expect(calculateMatchResult(1, 3)).toEqual({
      homeTeamStats: {
        points: 0,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 1,
        goalsAgainst: 3,
      },
      awayTeamStats: {
        points: 3,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 3,
        goalsAgainst: 1,
      },
    });
  });

  it("gives a draw 1 point each", () => {
    expect(calculateMatchResult(2, 2)).toEqual({
      homeTeamStats: {
        points: 1,
        wins: 0,
        draws: 1,
        losses: 0,
        goalsFor: 2,
        goalsAgainst: 2,
      },
      awayTeamStats: {
        points: 1,
        wins: 0,
        draws: 1,
        losses: 0,
        goalsFor: 2,
        goalsAgainst: 2,
      },
    });
  });
});
