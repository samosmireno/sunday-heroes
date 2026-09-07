import { describe, expect, it } from "vitest";
import { CompetitionType } from "@repo/shared-types";
import {
  exceedsCeiling,
  leagueSeasonCeiling,
  runwayEnd,
  votingThresholdAdvisory,
} from "./voting-threshold-advisory";

describe("runwayEnd", () => {
  it("is twice the threshold, so the admin never types it", () => {
    expect(runwayEnd(1)).toBe(2);
    expect(runwayEnd(5)).toBe(10);
    expect(runwayEnd(50)).toBe(100);
  });
});

describe("leagueSeasonCeiling", () => {
  it("is n - 1 for a single round robin", () => {
    expect(leagueSeasonCeiling(4, false)).toBe(3);
    expect(leagueSeasonCeiling(3, false)).toBe(2);
    expect(leagueSeasonCeiling(16, false)).toBe(15);
  });

  it("doubles for a double round robin", () => {
    expect(leagueSeasonCeiling(4, true)).toBe(6);
    expect(leagueSeasonCeiling(3, true)).toBe(4);
    expect(leagueSeasonCeiling(16, true)).toBe(30);
  });

  it("has nothing to say below two teams", () => {
    expect(leagueSeasonCeiling(1, false)).toBeNull();
    expect(leagueSeasonCeiling(0, true)).toBeNull();
    expect(leagueSeasonCeiling(Number.NaN, false)).toBeNull();
  });
});

describe("exceedsCeiling", () => {
  it("is true only strictly above the ceiling", () => {
    expect(exceedsCeiling(5, 3)).toBe(true);
    expect(exceedsCeiling(4, 3)).toBe(true);
    expect(exceedsCeiling(3, 3)).toBe(false);
    expect(exceedsCeiling(2, 3)).toBe(false);
  });

  it("is false where there is no ceiling to exceed", () => {
    expect(exceedsCeiling(50, null)).toBe(false);
  });
});

describe("votingThresholdAdvisory", () => {
  const duel = {
    competitionType: CompetitionType.DUEL,
    numberOfTeams: undefined,
    doubleRoundRobin: false,
  };

  it("reads an untouched field as no threshold", () => {
    expect(votingThresholdAdvisory({ ...duel, threshold: "" })).toEqual({
      kind: "no-threshold",
    });
    expect(votingThresholdAdvisory({ ...duel, threshold: undefined })).toEqual({
      kind: "no-threshold",
    });
    expect(votingThresholdAdvisory({ ...duel, threshold: null })).toEqual({
      kind: "no-threshold",
    });
  });

  it("says nothing about a value the form will not accept", () => {
    // Not the off-state: the field is refusing these, and "no threshold,
    // everyone can vote" under a field in error describes a rule the admin
    // cannot create. Only an untouched field is the off-state.
    for (const threshold of ["0", "-3", "2.5", "many", "51"]) {
      expect(votingThresholdAdvisory({ ...duel, threshold })).toEqual({
        kind: "out-of-range",
      });
    }
  });

  it("reads an untouched field as no threshold", () => {
    for (const threshold of ["", null, undefined]) {
      expect(votingThresholdAdvisory({ ...duel, threshold })).toEqual({
        kind: "no-threshold",
      });
    }
  });

  it("accepts the whole range the schema allows", () => {
    for (const threshold of ["1", "50"]) {
      expect(votingThresholdAdvisory({ ...duel, threshold })).toMatchObject({
        kind: "threshold",
        threshold: Number(threshold),
      });
    }
  });

  it("ignores a team count outside what a League can have", () => {
    // 2 teams and 17 teams are both refused by the schema, so there is no
    // fixture list to derive a ceiling from.
    for (const numberOfTeams of ["2", "17"]) {
      expect(
        votingThresholdAdvisory({
          ...duel,
          competitionType: CompetitionType.LEAGUE,
          threshold: "5",
          numberOfTeams,
        }),
      ).toMatchObject({ ceiling: null });
    }
  });

  it("derives the runway from the number the admin typed", () => {
    // The number input hands react-hook-form a string, never a number.
    expect(votingThresholdAdvisory({ ...duel, threshold: "5" })).toEqual({
      kind: "threshold",
      threshold: 5,
      runwayEnd: 10,
      firstGatedMatch: 11,
      pooledExample: 4,
      ceiling: null,
    });
  });

  it("drops the pooling example at a threshold of one, where it reads as zero", () => {
    const advisory = votingThresholdAdvisory({ ...duel, threshold: 1 });

    expect(advisory).toMatchObject({ threshold: 1, pooledExample: null });
  });

  it("gives a Duel no ceiling, even with a stale team count on the form", () => {
    const advisory = votingThresholdAdvisory({
      competitionType: CompetitionType.DUEL,
      numberOfTeams: "4",
      doubleRoundRobin: false,
      threshold: "5",
    });

    expect(advisory).toMatchObject({ ceiling: null });
  });

  it("gives a Knockout no ceiling", () => {
    const advisory = votingThresholdAdvisory({
      competitionType: CompetitionType.KNOCKOUT,
      numberOfTeams: "8",
      doubleRoundRobin: false,
      threshold: "5",
    });

    expect(advisory).toMatchObject({ ceiling: null });
  });

  it("gives a League the exact ceiling for its team count, and flags the excess", () => {
    const advisory = votingThresholdAdvisory({
      competitionType: CompetitionType.LEAGUE,
      numberOfTeams: "4",
      doubleRoundRobin: false,
      threshold: "5",
    });

    expect(advisory).toMatchObject({
      threshold: 5,
      ceiling: {
        teams: 4,
        doubleRoundRobin: false,
        matches: 3,
        exceeded: true,
      },
    });
  });

  it("puts the same threshold under the ceiling once the League plays twice", () => {
    const advisory = votingThresholdAdvisory({
      competitionType: CompetitionType.LEAGUE,
      numberOfTeams: "4",
      doubleRoundRobin: true,
      threshold: "5",
    });

    expect(advisory).toMatchObject({
      ceiling: {
        teams: 4,
        doubleRoundRobin: true,
        matches: 6,
        exceeded: false,
      },
    });
  });

  it("waits for a team count before stating a League ceiling", () => {
    const advisory = votingThresholdAdvisory({
      competitionType: CompetitionType.LEAGUE,
      numberOfTeams: "",
      doubleRoundRobin: false,
      threshold: "5",
    });

    expect(advisory).toMatchObject({ ceiling: null });
  });

  it("says nothing about a ceiling while there is no threshold to compare", () => {
    expect(
      votingThresholdAdvisory({
        competitionType: CompetitionType.LEAGUE,
        numberOfTeams: "4",
        doubleRoundRobin: false,
        threshold: "",
      }),
    ).toEqual({ kind: "no-threshold" });
  });
});
