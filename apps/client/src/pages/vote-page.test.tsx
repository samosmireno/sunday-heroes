import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import axios from "axios";
import { VoterEligibility } from "@repo/shared-types";
import { SidebarProvider } from "@/components/ui/sidebar";
import { axiosResponse, createTestProviders } from "@/test/harness";
import { VotingStatus } from "@/features/voting/hooks/use-voting-status";
import VotePage from "./vote-page";

/**
 * The vote page's read. It is a bespoke payload rather than a shared type — the
 * only surface that names a Season is this one — so its builder lives here
 * rather than in the shared fixtures.
 */
function votingStatus(overrides: Partial<VotingStatus> = {}): VotingStatus {
  return {
    matchId: "match-1",
    votingOpen: true,
    votingEndsAt: "2026-09-20T12:00:00.000Z",
    hasVoted: false,
    eligibility: runwayEligibility(),
    seasonNumber: 3,
    players: [
      { id: "mp-ana", nickname: "Ana", isHome: true, canVoteFor: true },
      // The viewer: nobody votes for themselves, so the live ballot leaves
      // them out of both columns.
      { id: "mp-bea", nickname: "Bea", isHome: true, canVoteFor: false },
      { id: "mp-cal", nickname: "Cal", isHome: false, canVoteFor: true },
      { id: "mp-dan", nickname: "Dan", isHome: false, canVoteFor: true },
    ],
    ...overrides,
  };
}

/** A Competition with no threshold, and every armed Competition's runway. */
function runwayEligibility(): VoterEligibility {
  return {
    canVote: true,
    qualified: false,
    armed: false,
    threshold: null,
    matchesThisSeason: 2,
    remaining: 0,
  };
}

/** An Eligible voter of an armed Competition: the gate is open to them. */
function qualifiedEligibility(): VoterEligibility {
  return {
    canVote: true,
    qualified: true,
    armed: true,
    threshold: 5,
    matchesThisSeason: 6,
    remaining: 0,
  };
}

/** A participant the armed Voting gate has shut out, part-way to the threshold. */
function blockedEligibility(
  threshold: number,
  matchesThisSeason: number,
): VoterEligibility {
  return {
    canVote: false,
    qualified: false,
    armed: true,
    threshold,
    matchesThisSeason,
    remaining: threshold - matchesThisSeason,
  };
}

/** The page under its own route, so `useParams` sees a match id as it does in the app. */
async function renderVotePage(status: VotingStatus) {
  vi.spyOn(axios, "get").mockResolvedValue(axiosResponse(status));

  render(
    <SidebarProvider>
      <Routes>
        <Route path="/vote/:matchId" element={<VotePage />} />
      </Routes>
    </SidebarProvider>,
    {
      wrapper: createTestProviders({ at: "/vote/match-1?voterId=player-bea" }),
    },
  );

  await screen.findByText("Home Team");
}

const playerCard = (nickname: string) =>
  screen.getByRole("button", { name: new RegExp(nickname) });

describe("VotePage and the Voting gate", () => {
  beforeEach(() => {
    // jsdom implements no matchMedia, and the header's sidebar trigger asks the
    // sidebar provider for one on mount.
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows a blocked participant the whole ballot, read-only and with themselves on it", async () => {
    await renderVotePage(
      votingStatus({ eligibility: blockedEligibility(5, 3) }),
    );

    // Both team columns, and the viewer among them: this is the ballot the
    // match has, not a trimmed-down version of it.
    for (const nickname of ["Ana", "Bea", "Cal", "Dan"]) {
      expect(playerCard(nickname).hasAttribute("disabled")).toBe(true);
    }

    fireEvent.click(playerCard("Ana"));
    expect(screen.getByText("No players selected yet")).toBeDefined();
  });

  it("names the threshold, the count, what is left and the Season in the banner", async () => {
    await renderVotePage(
      votingStatus({ eligibility: blockedEligibility(5, 3), seasonNumber: 3 }),
    );

    expect(
      screen.getByText(/needs 5 matches played within a single season/),
    ).toBeDefined();
    expect(screen.getByText(/played 3 of them in Season 3/)).toBeDefined();
    expect(screen.getByText(/2 to go/)).toBeDefined();
    expect(screen.getByText(/do not carry over/)).toBeDefined();
  });

  it("words the count as where the reader stands, not as a countdown to this ballot", async () => {
    // The number moves under the reader: a League Fixture is invited to vote on
    // before it is completed, so the admin pressing Complete can tick the
    // counter up mid-vote. The banner must not read as a promise about this
    // ballot.
    await renderVotePage(
      votingStatus({ eligibility: blockedEligibility(5, 3) }),
    );

    expect(screen.getByText(/not a countdown to this ballot/)).toBeDefined();
  });

  it("falls back to an unnamed season when the Competition has no Current season", async () => {
    await renderVotePage(
      votingStatus({
        eligibility: blockedEligibility(5, 3),
        seasonNumber: null,
      }),
    );

    expect(screen.getByText(/played 3 of them this season/)).toBeDefined();
  });

  it("replaces the submit affordance with a lock line and keeps the way back", async () => {
    await renderVotePage(
      votingStatus({ eligibility: blockedEligibility(5, 3) }),
    );

    expect(screen.getByText("You can't submit votes yet")).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Back to Dashboard" }),
    ).toBeDefined();
    expect(screen.queryByRole("button", { name: "Submit Votes" })).toBeNull();
  });

  it.each([
    ["the runway", runwayEligibility()],
    ["an Eligible voter", qualifiedEligibility()],
  ])(
    "renders the page exactly as before for %s",
    async (_case, eligibility) => {
      await renderVotePage(votingStatus({ eligibility }));

      // No banner, no lock, and the viewer back off a ballot they can cast.
      expect(screen.queryByText(/single season/)).toBeNull();
      expect(screen.queryByText("You can't submit votes yet")).toBeNull();
      expect(
        screen.queryByRole("button", { name: "Back to Dashboard" }),
      ).toBeNull();
      expect(screen.queryByRole("button", { name: /Bea/ })).toBeNull();
      expect(playerCard("Ana").hasAttribute("disabled")).toBe(false);
    },
  );

  it("leaves the three states that came before it in front of the fourth", async () => {
    // Voting on the runway and blocked afterwards is reachable: the gate arms
    // once, on some other match completing.
    vi.spyOn(axios, "get").mockResolvedValue(
      axiosResponse(
        votingStatus({ hasVoted: true, eligibility: blockedEligibility(5, 3) }),
      ),
    );

    render(
      <SidebarProvider>
        <Routes>
          <Route path="/vote/:matchId" element={<VotePage />} />
        </Routes>
      </SidebarProvider>,
      {
        wrapper: createTestProviders({
          at: "/vote/match-1?voterId=player-bea",
        }),
      },
    );

    expect(
      await screen.findByText(/You have already submitted your votes/),
    ).toBeDefined();
    expect(screen.queryByText(/single season/)).toBeNull();
  });
});
