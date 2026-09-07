import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Role } from "@repo/shared-types";
import { createTestProviders } from "@/test/harness";
import {
  blockedEligibility,
  eligibleUnderGate,
  matchVotes,
  pendingVote,
  voterEligibility,
} from "@/test/fixtures";
import { PendingVotesTable } from "./pending-votes-table";

const ANA = pendingVote({
  playerName: "Ana",
  playerId: "player-ana",
  eligibility: eligibleUnderGate(5, 6),
});

const BOJAN = pendingVote({
  playerName: "Bojan",
  playerId: "player-bojan",
  eligibility: blockedEligibility(5, 2),
});

function renderList(players = [ANA, BOJAN], userRole = Role.ADMIN) {
  const onVoteClick = vi.fn();
  render(
    <PendingVotesTable
      votingData={matchVotes({ players, userRole })}
      onVoteClick={onVoteClick}
    />,
    { wrapper: createTestProviders() },
  );
  return onVoteClick;
}

describe("PendingVotesTable and the Voting gate", () => {
  it("keeps an ineligible player on the list", () => {
    // Dropping the row would leave the admin wondering where the name went.
    renderList();

    expect(screen.getByText("Ana")).toBeDefined();
    expect(screen.getByText("Bojan")).toBeDefined();
  });

  it("shows the meter and Not eligible yet where the Vote button was", () => {
    renderList([BOJAN]);

    expect(screen.getByText("Not eligible yet")).toBeDefined();
    expect(screen.getByText("2/5")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Vote" })).toBeNull();
  });

  it("badges an Eligible voter, and still offers the Vote button", () => {
    renderList([ANA]);

    expect(screen.getByText("Eligible")).toBeDefined();
    expect(screen.getByRole("button", { name: "Vote" })).toBeDefined();
    expect(screen.queryByText("Not eligible yet")).toBeNull();
  });

  it("spells the per-Season rule out where the meter sits", () => {
    renderList([BOJAN]);

    const title = screen
      .getByText("Not eligible yet")
      .closest("[title]")
      ?.getAttribute("title");

    expect(title).toContain(
      "5 completed matches played within a single season",
    );
    expect(title).toContain("played 2 this season");
    expect(title).toContain("do not add up across seasons");
  });

  it("renders exactly as today during the runway — no badges at all", () => {
    renderList([
      pendingVote({ playerName: "Cveta", eligibility: voterEligibility() }),
    ]);

    expect(screen.getByRole("button", { name: "Vote" })).toBeDefined();
    expect(screen.queryByText("Eligible")).toBeNull();
    expect(screen.queryByText("Not eligible yet")).toBeNull();
    expect(
      screen.queryByTitle(/matches played within a single season/),
    ).toBeNull();
  });

  it("badges nobody in a Competition with no threshold, ineligible or not", () => {
    // `canVote` is true for everyone when there is no gate, so there is no
    // ineligible player to badge either.
    renderList([
      pendingVote({ playerName: "Cveta", eligibility: voterEligibility() }),
      pendingVote({
        playerName: "Dino",
        playerId: "player-dino",
        voted: true,
        eligibility: voterEligibility(),
      }),
    ]);

    expect(screen.queryByText("Eligible")).toBeNull();
    expect(screen.getAllByRole("button", { name: "Vote" })).toHaveLength(1);
  });

  it("leaves a player who already voted alone, badge and all", () => {
    renderList([
      pendingVote({
        playerName: "Ana",
        playerId: "player-ana",
        voted: true,
        eligibility: eligibleUnderGate(5, 6),
      }),
    ]);

    expect(screen.getByText("Eligible")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Vote" })).toBeNull();
  });

  it("keeps the gate out of the way of the role check", () => {
    // A PLAYER may only ever vote for themselves; the gate narrows that, never
    // widens it.
    renderList([ANA], Role.PLAYER);

    expect(screen.getByText("Eligible")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Vote" })).toBeNull();
  });
});
