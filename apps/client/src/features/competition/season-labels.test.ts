import { describe, expect, it } from "vitest";
import { seasonResponse } from "@/test/fixtures";
import {
  addMatchHint,
  allSeasonsOptionLabel,
  duelStatsCaption,
  pastSeasonBanner,
  seasonOptionLabel,
  seasonTriggerLabel,
} from "./season-labels";

const pastSeason = seasonResponse({
  number: 2,
  startedAt: "2025-03-02T10:00:00.000Z",
  endedAt: "2025-09-14T10:00:00.000Z",
});
const currentSeason = seasonResponse({
  number: 3,
  startedAt: "2025-09-14T10:00:00.000Z",
  endedAt: null,
});

describe("season selector labels", () => {
  it("an option names the Season and its dates, or the day the Current season started", () => {
    expect(seasonOptionLabel(pastSeason)).toBe(
      "Season 2 · 2 Mar 2025 – 14 Sep 2025",
    );
    expect(seasonOptionLabel(currentSeason)).toBe(
      "Season 3 · since 14 Sep 2025",
    );
  });

  it("the closed trigger keeps to a short label that fits a phone header", () => {
    expect(seasonTriggerLabel(currentSeason)).toBe("Season 3 · current");
    expect(seasonTriggerLabel(pastSeason)).toBe("Season 2 · Mar 25 – Sep 25");
  });

  it("the All seasons option counts the Seasons", () => {
    expect(allSeasonsOptionLabel(3)).toBe("All seasons · 3 seasons");
  });
});

describe("pastSeasonBanner", () => {
  it("says when the Season closed and offers the way back to the Current season", () => {
    expect(pastSeasonBanner(pastSeason, 3)).toEqual({
      message:
        "Season 2 · closed 14 Sep 2025. Matches from a past season can be viewed but not changed.",
      backButton: "Back to Season 3",
    });
  });
});

describe("duelStatsCaption", () => {
  it("names the selected Season's match count as the percentage filter's denominator", () => {
    expect(duelStatsCaption(2, 25)).toBe(
      "Season 2 · 25 matches. Min. matches % is a share of these 25.",
    );
  });

  it("sums the matches under All seasons", () => {
    expect(duelStatsCaption("all", 40)).toBe(
      "All seasons · 40 matches. Min. matches % is a share of these 40.",
    );
  });

  it("counts one match in the singular", () => {
    expect(duelStatsCaption(3, 1)).toBe(
      "Season 3 · 1 match. Min. matches % is a share of this 1.",
    );
  });
});

describe("addMatchHint", () => {
  it("tells the admin on a Past season where a new match goes", () => {
    expect(addMatchHint(3)).toBe("New matches go to Season 3");
  });
});
