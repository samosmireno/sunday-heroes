import { describe, expect, it } from "vitest";
import { ConflictError } from "../utils/errors";
import { SeasonService } from "./season-service";

describe("SeasonService.assertSeasonOpen", () => {
  it("returns for a Match of the Current season", () => {
    expect(() =>
      SeasonService.assertSeasonOpen({ season: { endedAt: null } }),
    ).not.toThrow();
  });

  it("refuses a Match of a Past season with the conflict", () => {
    expect(() =>
      SeasonService.assertSeasonOpen({
        season: { endedAt: new Date("2026-03-01T10:00:00.000Z") },
      }),
    ).toThrow(
      new ConflictError("Matches from a past season cannot be changed."),
    );
  });
});
