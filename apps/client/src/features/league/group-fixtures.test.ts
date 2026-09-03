import { describe, expect, it } from "vitest";
import { leagueMatchResponse } from "@/test/fixtures";
import { groupFixtures } from "./group-fixtures";

/** Seasons 1 and 2 are Past seasons; Season 3 is the Current season. */
const fixture = (id: string, season: number, round: number) =>
  leagueMatchResponse({
    id,
    round,
    season: { number: season, isClosed: season < 3 },
  });

describe("groupFixtures", () => {
  it("one Season: the matches by round, rounds ascending, a round in the order the list gives", () => {
    const r1a = fixture("r1a", 2, 1);
    const r1b = fixture("r1b", 2, 1);
    const r2 = fixture("r2", 2, 2);
    const r3 = fixture("r3", 2, 3);

    const grouped = groupFixtures([r3, r1a, r2, r1b], 2);

    expect(grouped).toEqual({
      view: "rounds",
      rounds: { 1: [r1a, r1b], 2: [r2], 3: [r3] },
    });
    if (grouped.view !== "rounds") throw new Error("expected rounds");
    expect(Object.keys(grouped.rounds).map(Number)).toEqual([1, 2, 3]);
  });

  it("the Current season, asked for with no season, groups by round the same way", () => {
    const r1 = fixture("r1", 3, 1);
    const r2 = fixture("r2", 3, 2);

    expect(groupFixtures([r1, r2], undefined)).toEqual({
      view: "rounds",
      rounds: { 1: [r1], 2: [r2] },
    });
  });

  it("All seasons: the matches by season, newest first, then by round ascending", () => {
    const s1r1 = fixture("s1r1", 1, 1);
    const s1r2 = fixture("s1r2", 1, 2);
    const s2r1a = fixture("s2r1a", 2, 1);
    const s2r1b = fixture("s2r1b", 2, 1);
    const s2r2 = fixture("s2r2", 2, 2);
    const s3r1 = fixture("s3r1", 3, 1);

    const grouped = groupFixtures(
      [s1r2, s2r2, s3r1, s1r1, s2r1a, s2r1b],
      "all",
    );

    expect(grouped).toEqual({
      view: "seasons",
      seasons: [
        { season: { number: 3, isClosed: false }, rounds: { 1: [s3r1] } },
        {
          season: { number: 2, isClosed: true },
          rounds: { 1: [s2r1a, s2r1b], 2: [s2r2] },
        },
        {
          season: { number: 1, isClosed: true },
          rounds: { 1: [s1r1], 2: [s1r2] },
        },
      ],
    });
    if (grouped.view !== "seasons") throw new Error("expected seasons");
    expect(grouped.seasons.map((group) => group.season.number)).toEqual([
      3, 2, 1,
    ]);
    expect(Object.keys(grouped.seasons[1].rounds).map(Number)).toEqual([1, 2]);
  });

  it("no matches: an empty grouping for either view", () => {
    expect(groupFixtures([], 1)).toEqual({ view: "rounds", rounds: {} });
    expect(groupFixtures([], "all")).toEqual({ view: "seasons", seasons: [] });
  });
});
