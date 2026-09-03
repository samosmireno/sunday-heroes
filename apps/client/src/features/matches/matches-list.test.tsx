import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { createTestProviders } from "@/test/harness";
import { matchPageResponse } from "@/test/fixtures";
import MatchesList from "./matches-list";

const twoSeasons = [
  matchPageResponse({ id: "match-1", season: { number: 2, isClosed: false } }),
  matchPageResponse({ id: "match-2", season: { number: 1, isClosed: true } }),
];

/** Expands the first match and reads how many columns its details row spans. */
function expandedDetailsSpan() {
  fireEvent.click(screen.getAllByRole("button", { name: "Expand details" })[0]);
  const details = screen
    .getAllByRole("cell")
    .find((cell) => cell.hasAttribute("colspan"));
  return Number(details?.getAttribute("colspan"));
}

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

  it.each([false, true])(
    "spans the expanded details row across every column (Season column: %s)",
    (showSeason) => {
      render(<MatchesList matches={twoSeasons} showSeason={showSeason} />, {
        wrapper: createTestProviders(),
      });

      const columnCount = screen.getAllByRole("columnheader").length;
      expect(columnCount).toBe(showSeason ? 8 : 7);
      expect(expandedDetailsSpan()).toBe(columnCount);
    },
  );

  it("reads the closed Season in the actions cell of a Past season's match, for everyone", () => {
    render(<MatchesList matches={twoSeasons} />, {
      wrapper: createTestProviders(),
    });

    expect(screen.getByText("Season 1 · closed")).toBeDefined();
    expect(screen.queryByText("Season 2 · closed")).toBeNull();
  });
});
