import { describe, expect, it } from "vitest";
import { seasonResponse } from "@/test/fixtures";
import { currentSeasonLabel } from "./season-label";

describe("currentSeasonLabel", () => {
  it("names the Current season and the day it started", () => {
    expect(
      currentSeasonLabel(
        seasonResponse({ number: 1, startedAt: "2025-09-12T10:00:00.000Z" }),
      ),
    ).toBe("Current season: Season 1 · started 12 Sep 2025");
  });
});
