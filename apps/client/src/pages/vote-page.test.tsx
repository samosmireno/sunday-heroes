import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "sonner";
import axiosInstance, { SessionExpiredError } from "@/config/axios-config";
import { axiosResponse, createTestProviders } from "@/test/harness";
import {
  blockedEligibility,
  eligibleUnderGate,
  voterEligibility,
} from "@/test/fixtures";
import { VotingStatusResponse } from "@/features/voting/hooks/use-voting-status";
import VotePage from "./vote-page";

/**
 * The vote page's read. It is a bespoke payload rather than a shared type —
 * the only surface that names a Season is this one — so its builder lives
 * here; the eligibility records inside it are shared and come from the
 * fixtures.
 */
function votingStatus(
  overrides: Partial<VotingStatusResponse> = {},
): VotingStatusResponse {
  return {
    matchId: "match-1",
    votingOpen: true,
    votingEndsAt: "2026-09-20T12:00:00.000Z",
    hasVoted: false,
    eligibility: voterEligibility({ matchesThisSeason: 2 }),
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

const ballotPath = "/vote/match-1?voterId=player-bea";

/** The page under its own route, so `useParams` sees a match id as it does in the app. */
function mountVotePage(status: VotingStatusResponse) {
  vi.spyOn(axiosInstance, "get").mockResolvedValue(axiosResponse(status));

  return render(
    <Routes>
      <Route path="/vote/:matchId" element={<VotePage />} />
    </Routes>,
    {
      wrapper: createTestProviders({ at: ballotPath }),
    },
  );
}

/** Mounts and waits for the ballot; the refusal states have no columns to wait for. */
async function renderVotePage(status: VotingStatusResponse) {
  const view = mountVotePage(status);
  await screen.findByText("Home Team");
  return view;
}

const playerCard = (nickname: string) =>
  screen.getByRole("button", { name: new RegExp(nickname) });

beforeEach(() => {
  // The ballot draft outlives a render on purpose, so each test starts without one.
  sessionStorage.clear();
  localStorage.clear();
});

describe("VotePage and the Voting gate", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
    ["the runway", voterEligibility({ matchesThisSeason: 2 })],
    ["an Eligible voter", eligibleUnderGate(5, 6)],
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

  it("stops the sidebar asking a locked-out reader to submit", async () => {
    await renderVotePage(
      votingStatus({ eligibility: blockedEligibility(5, 3) }),
    );

    // The deadline still matters — it is when this ballot closes without
    // them — but as a fact, not as an instruction the lock line contradicts.
    expect(screen.getByText("Voting closes on:")).toBeDefined();
    expect(screen.queryByText("Please submit your votes before:")).toBeNull();
    expect(screen.queryByText("Select Your Top 3 Players")).toBeNull();
  });

  it("keeps the deadline an instruction for a voter who can act on it", async () => {
    await renderVotePage(
      votingStatus({ eligibility: eligibleUnderGate(5, 6) }),
    );

    expect(screen.getByText("Please submit your votes before:")).toBeDefined();
    expect(screen.getByText("Select Your Top 3 Players")).toBeDefined();
  });

  it("leaves the three states that came before it in front of the fourth", async () => {
    // Voting on the runway and blocked afterwards is reachable: the gate arms
    // once, on some other match completing.
    mountVotePage(
      votingStatus({ hasVoted: true, eligibility: blockedEligibility(5, 3) }),
    );

    expect(
      await screen.findByText(/You have already submitted your votes/),
    ).toBeDefined();
    expect(screen.queryByText(/single season/)).toBeNull();
  });
});

describe("VotePage when the session dies at submit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Picks three names on a live ballot and presses Submit. */
  async function castBallot() {
    const view = await renderVotePage(votingStatus());

    fireEvent.click(playerCard("Ana"));
    fireEvent.click(playerCard("Cal"));
    fireEvent.click(playerCard("Dan"));
    expect(screen.getByText("Your selection (3/3)")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Submit Votes" }));

    return view;
  }

  it("says plainly that nothing was submitted, and never claims success", async () => {
    vi.spyOn(axiosInstance, "post").mockRejectedValue(
      new SessionExpiredError(ballotPath),
    );

    await castBallot();

    expect(
      await screen.findByText("Your votes were not submitted"),
    ).toBeDefined();
    // The failure this replaces: a bare redirect to the landing page, no
    // message, and a player who went away believing they had voted.
    expect(screen.queryByText(/Votes Submitted Successfully/)).toBeNull();
    expect(screen.queryByText(/Thank you for voting/)).toBeNull();
    // And no submit button left to press against a session that is gone.
    expect(screen.queryByRole("button", { name: "Submit Votes" })).toBeNull();
  });

  it("keeps the three picks on screen and through a return to the ballot", async () => {
    vi.spyOn(axiosInstance, "post").mockRejectedValue(
      new SessionExpiredError(ballotPath),
    );

    const view = await castBallot();
    await screen.findByText("Your votes were not submitted");

    expect(screen.getByText("Your selection (3/3)")).toBeDefined();

    // Signing in is a full round trip out of the app and back. The picks have
    // to be waiting when the player returns, or the vote costs them the whole
    // ballot a second time and they simply do not bother.
    view.unmount();
    await renderVotePage(votingStatus());

    expect(screen.getByText("Your selection (3/3)")).toBeDefined();
  });

  it("routes the player through sign-in back to this ballot", async () => {
    vi.spyOn(axiosInstance, "post").mockRejectedValue(
      new SessionExpiredError(ballotPath),
    );

    await castBallot();
    await screen.findByText("Your votes were not submitted");

    fireEvent.click(screen.getByRole("button", { name: "Sign in and submit" }));

    expect(sessionStorage.getItem("redirectAfterLogin")).toBe(ballotPath);
  });

  it("tells the player what the server actually said about an ordinary refusal", async () => {
    // A 400 is the server refusing this vote, not the session going away, so
    // it keeps the toast-and-carry-on path — and the toast now carries the
    // server's own words. Every 400 used to reach the player as "Request
    // failed with status code 400", which named none of the nine rules
    // `submitVotes` enforces.
    const errorToast = vi.spyOn(toast, "error");
    vi.spyOn(axiosInstance, "post").mockRejectedValue(
      Object.assign(new Error("Request failed with status code 400"), {
        status: 400,
        response: { status: 400, data: { message: "Voting is not open" } },
      }),
    );

    await castBallot();

    await waitFor(() =>
      expect(errorToast).toHaveBeenCalledWith("Voting is not open"),
    );
    expect(screen.queryByText("Your votes were not submitted")).toBeNull();
  });
});

describe("VotePage when the ballot itself is refused", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the server's reason rather than falling over on its error body", async () => {
    // The read is authenticated now, so it can be refused — and what came back
    // used to be handed to `ErrorState` whole. An object as a React child
    // throws, which took the page to the error boundary instead of telling the
    // reader anything.
    vi.spyOn(axiosInstance, "get").mockRejectedValue(
      Object.assign(new AxiosError("Request failed with status code 403"), {
        response: {
          status: 403,
          data: {
            code: 403,
            message: "You are not authorized to view this player's ballot",
          },
        },
      }),
    );

    render(
      <Routes>
        <Route path="/vote/:matchId" element={<VotePage />} />
      </Routes>,
      { wrapper: createTestProviders({ at: ballotPath }) },
    );

    expect(
      await screen.findByText(
        "You are not authorized to view this player's ballot",
      ),
    ).toBeDefined();
  });
});
