import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createTestProviders } from "@/test/harness";
import { matchPageResponse } from "@/test/fixtures";
import MatchesList from "./matches-list";

const twoSeasons = [
  matchPageResponse({ id: "match-1", season: { number: 2, isClosed: false } }),
  matchPageResponse({ id: "match-2", season: { number: 1, isClosed: true } }),
];

describe("MatchesList", () => {
  it("shows which season each match belongs to under All seasons", () => {
    render(<MatchesList matches={twoSeasons} showSeason />, {
      wrapper: createTestProviders(),
    });

    expect(screen.getByRole("columnheader", { name: "Season" })).toBeDefined();
    expect(screen.getByText("Season 2")).toBeDefined();
    expect(screen.getByText("Season 1")).toBeDefined();
  });

  it("has no Season column on a single season", () => {
    render(<MatchesList matches={twoSeasons} />, {
      wrapper: createTestProviders(),
    });

    expect(screen.queryByRole("columnheader", { name: "Season" })).toBeNull();
    expect(screen.queryByText("Season 2")).toBeNull();
  });
});
