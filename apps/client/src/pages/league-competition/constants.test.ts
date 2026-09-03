import { describe, expect, it } from "vitest";
import { seasonResponse } from "@/test/fixtures";
import { TAB_CONFIG } from "./constants";

const seasons = [
  seasonResponse({
    number: 1,
    endedAt: "2025-03-02T10:00:00.000Z",
    matchCount: 12,
    completedMatchCount: 12,
  }),
  seasonResponse({ number: 2, matchCount: 6, completedMatchCount: 3 }),
];

const statsCaption = TAB_CONFIG.find((tab) => tab.value === "stats")?.caption;

describe("the Stats tab", () => {
  it("captions its card with the Season and the Completed matches its totals cover", () => {
    expect(statsCaption?.(1, seasons)).toBe("Season 1 · 12 completed matches");
    expect(statsCaption?.("all", seasons)).toBe(
      "All seasons · 15 completed matches",
    );
  });
});
