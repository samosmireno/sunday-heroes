import { describe, expect, it } from "vitest";
import { leagueMatchResponse } from "@/test/fixtures";
import { displayedScore, leftNotCompleted } from "./fixture-display";

const pastSeason = { number: 1, isClosed: true };
const currentSeason = { number: 2, isClosed: false };

describe("leftNotCompleted", () => {
  it("is a Fixture of a Past season that was never marked completed", () => {
    expect(
      leftNotCompleted(
        leagueMatchResponse({ season: pastSeason, isCompleted: false }),
      ),
    ).toBe(true);
  });

  it("is not a Completed match of a Past season, nor any Fixture of the Current season", () => {
    expect(
      leftNotCompleted(
        leagueMatchResponse({ season: pastSeason, isCompleted: true }),
      ),
    ).toBe(false);
    expect(
      leftNotCompleted(
        leagueMatchResponse({ season: currentSeason, isCompleted: false }),
      ),
    ).toBe(false);
  });
});

describe("displayedScore", () => {
  it("shows dashes for a Fixture left not completed with no score entered, so it is not read as a goalless draw", () => {
    expect(
      displayedScore(
        leagueMatchResponse({
          season: pastSeason,
          isCompleted: false,
          homeScore: 0,
          awayScore: 0,
        }),
      ),
    ).toEqual({ home: "–", away: "–" });
  });

  it("shows the score entered on a Fixture left not completed", () => {
    expect(
      displayedScore(
        leagueMatchResponse({
          season: pastSeason,
          isCompleted: false,
          homeScore: 3,
          awayScore: 0,
        }),
      ),
    ).toEqual({ home: "3", away: "0" });
  });

  it("shows a goalless draw as 0 and 0 once the match is completed", () => {
    expect(
      displayedScore(
        leagueMatchResponse({
          season: pastSeason,
          isCompleted: true,
          homeScore: 0,
          awayScore: 0,
        }),
      ),
    ).toEqual({ home: "0", away: "0" });
  });

  it("shows a not-completed Fixture of the Current season as 0 and 0, as today", () => {
    expect(
      displayedScore(
        leagueMatchResponse({
          season: currentSeason,
          isCompleted: false,
          homeScore: 0,
          awayScore: 0,
        }),
      ),
    ).toEqual({ home: "0", away: "0" });
  });
});
