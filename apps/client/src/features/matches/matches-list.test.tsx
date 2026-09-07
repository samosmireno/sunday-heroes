import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { VotingStatus } from "@repo/shared-types";
import { createTestProviders } from "@/test/harness";
import {
  blockedEligibility,
  matchPageResponse,
  voterEligibility,
} from "@/test/fixtures";
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

/** An open match, with the viewer standing wherever the Voting gate puts them. */
function openMatch(
  viewerEligibility = voterEligibility(),
  isAdmin = false,
  viewerPlayed = true,
) {
  return matchPageResponse({
    votingEnabled: true,
    votingStatus: VotingStatus.OPEN,
    pendingVotes: 2,
    isAdmin,
    viewerEligibility,
    viewerPlayed,
  });
}

describe("MatchesList and the Voting gate", () => {
  it("keeps the vote affordance, disabled with the viewer's count, for a blocked voter", () => {
    render(<MatchesList matches={[openMatch(blockedEligibility(5, 3))]} />, {
      wrapper: createTestProviders(),
    });

    const blocked = screen.getByRole("button", {
      name: "You cannot vote on this match yet",
    });
    expect(blocked.hasAttribute("disabled")).toBe(true);
    expect(blocked.textContent).toContain("3/5 to vote");
    expect(screen.queryByRole("button", { name: "Vote on this match" })).toBe(
      null,
    );
  });

  it("spells the per-Season rule out in the tooltip", () => {
    render(<MatchesList matches={[openMatch(blockedEligibility(5, 3))]} />, {
      wrapper: createTestProviders(),
    });

    // The title rides on the wrapper: a disabled button has no pointer events.
    const title = screen
      .getByRole("button", { name: "You cannot vote on this match yet" })
      .closest("span")
      ?.getAttribute("title");

    expect(title).toContain("5 matches played within a single season");
    expect(title).toContain("3 this season");
    expect(title).toContain("do not add up across seasons");
  });

  it("leaves the Voting Status badge to the Competition, not the viewer", () => {
    render(<MatchesList matches={[openMatch(blockedEligibility(5, 3))]} />, {
      wrapper: createTestProviders(),
    });

    expect(screen.getByText("2 pending votes")).toBeDefined();
  });

  it("leaves an admin the live link however the gate reads their own standing", () => {
    // This button is the only route to `/pending/:matchId`, the on-behalf-of
    // list. An admin who never played is blocked as a voter and must still be
    // able to open it — the gate is about the player a ballot is cast for.
    render(
      <MatchesList matches={[openMatch(blockedEligibility(5, 0), true)]} />,
      { wrapper: createTestProviders() },
    );

    expect(
      screen.getByRole("button", { name: "Vote on this match" }),
    ).toBeDefined();
    expect(screen.queryByText(/to vote/)).toBeNull();
  });

  it("says nothing to a blocked viewer who was never on the match", () => {
    // §6.3 scopes the lock to a match the viewer played. A non-participant has
    // no ballot on this match at all, so a Current-season counter here would be
    // a number about a match they were never part of.
    render(
      <MatchesList
        matches={[openMatch(blockedEligibility(5, 3), false, false)]}
      />,
      { wrapper: createTestProviders() },
    );

    expect(
      screen.queryByRole("button", {
        name: "You cannot vote on this match yet",
      }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Vote on this match" })).toBe(
      null,
    );
  });

  it("keeps the admin's live link on a match the admin never played", () => {
    render(
      <MatchesList
        matches={[openMatch(blockedEligibility(5, 0), true, false)]}
      />,
      { wrapper: createTestProviders() },
    );

    expect(
      screen.getByRole("button", { name: "Vote on this match" }),
    ).toBeDefined();
  });

  it("renders the cell exactly as before during the runway", () => {
    render(<MatchesList matches={[openMatch()]} />, {
      wrapper: createTestProviders(),
    });

    expect(
      screen.getByRole("button", { name: "Vote on this match" }),
    ).toBeDefined();
    expect(screen.queryByText(/to vote/)).toBeNull();
  });
});
