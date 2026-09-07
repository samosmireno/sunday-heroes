import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createTestProviders } from "@/test/harness";
import { matchPageResponse, playerResponse } from "@/test/fixtures";
import { MatchDetails } from "./match-details";

/** Four home players, so one tab holds the whole squad under test. */
function homeSquad(...players: Parameters<typeof playerResponse>[0][]) {
  return matchPageResponse({
    playerStats: players.map((player, index) =>
      playerResponse({
        id: `player-${index + 1}`,
        nickname: `Player ${index + 1}`,
        isHome: true,
        ...player,
      }),
    ),
  });
}

const medals = () => screen.queryAllByLabelText("Man of the match");

describe("MatchDetails: man of the match", () => {
  it("medals the player the server crowned", () => {
    const match = homeSquad(
      { nickname: "Ana", rating: 2.25, manOfTheMatch: true },
      { nickname: "Bea", rating: 1.75 },
    );

    render(<MatchDetails match={match} />, { wrapper: createTestProviders() });

    expect(medals()).toHaveLength(1);
    expect(medals()[0].closest("button")?.textContent).toContain("Ana");
  });

  it("medals both players of a shared crown", () => {
    // Two players on the same top rating are both man of the match. Deriving
    // the winner from the ratings here returned the first one and silently
    // dropped the other.
    const match = homeSquad(
      { nickname: "Ana", rating: 2, manOfTheMatch: true },
      { nickname: "Bea", rating: 2, manOfTheMatch: true },
      { nickname: "Cal", rating: 1 },
    );

    render(<MatchDetails match={match} />, { wrapper: createTestProviders() });

    expect(medals()).toHaveLength(2);
  });

  it("medals nobody on a match that closed with no votes", () => {
    // Every rating 0 makes every player joint-top; the server crowns none of
    // them, and the table must not invent a winner from the tie.
    const match = homeSquad(
      { nickname: "Ana", rating: 0 },
      { nickname: "Bea", rating: 0 },
    );

    render(<MatchDetails match={match} />, { wrapper: createTestProviders() });

    expect(medals()).toHaveLength(0);
  });

  it("follows the flag rather than the highest rating on screen", () => {
    // The two can disagree — a repaired match, or a rating the transform
    // recomputes on read. The stored decision wins.
    const match = homeSquad(
      { nickname: "Ana", rating: 3, manOfTheMatch: false },
      { nickname: "Bea", rating: 1, manOfTheMatch: true },
    );

    render(<MatchDetails match={match} />, { wrapper: createTestProviders() });

    expect(medals()).toHaveLength(1);
    expect(medals()[0].closest("button")?.textContent).toContain("Bea");
  });
});
