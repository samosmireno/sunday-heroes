import { describe, expect, it } from "vitest";
import {
  minMatchesForPercent,
  playedAtLeastPercent,
} from "./match-percentage-filter";

describe("Min. matches % filter", () => {
  it("50% of 2 matches admits a player with 1 match", () => {
    expect(minMatchesForPercent(50, 2)).toBe(1);
    expect(playedAtLeastPercent(1, 50, 2)).toBe(true);
    expect(playedAtLeastPercent(0, 50, 2)).toBe(false);
  });

  it("rounds a fraction of a match up, so 50% of 3 means 2", () => {
    expect(minMatchesForPercent(50, 3)).toBe(2);
    expect(playedAtLeastPercent(1, 50, 3)).toBe(false);
    expect(playedAtLeastPercent(2, 50, 3)).toBe(true);
  });

  it("100% keeps only the players who played every match", () => {
    expect(minMatchesForPercent(100, 4)).toBe(4);
    expect(playedAtLeastPercent(4, 100, 4)).toBe(true);
    expect(playedAtLeastPercent(3, 100, 4)).toBe(false);
  });

  it("a small share of many matches still rounds up", () => {
    expect(minMatchesForPercent(20, 11)).toBe(3);
    expect(playedAtLeastPercent(3, 20, 11)).toBe(true);
    expect(playedAtLeastPercent(2, 20, 11)).toBe(false);
  });

  it("with no matches yet, a percentage admits nobody", () => {
    expect(minMatchesForPercent(20, 0)).toBe(1);
    expect(playedAtLeastPercent(0, 20, 0)).toBe(false);
  });
});
