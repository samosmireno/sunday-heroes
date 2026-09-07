import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDuel,
  createDuelMatch,
  createRegisteredPlayer,
  createUserWithDashboard,
  setVotingEndsAt,
} from "../../../test/factories";
import { createMatchRequest } from "../../schemas/create-match-request-schema";
import { EmailService } from "../email-service";
import { VotingEligibilityService } from "../voting-eligibility-service";
import { MatchVotingService } from "./match-voting-service";

/** A Duel match between one home player and one away player. */
function pair(home: string, away: string): createMatchRequest["players"] {
  return [
    { nickname: home, goals: 0, assists: 0, position: 1, isHome: true },
    { nickname: away, goals: 0, assists: 0, position: 1, isHome: false },
  ];
}

type EmailKind = "invitation" | "reminder";

const QUIET_MS = 25;
const QUIET_WINDOWS = 2;

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function emailCalls() {
  return vi.mocked(EmailService.sendVotingInvitation).mock.calls;
}

/** Who was emailed about one match, by nickname. The reminder flag is the last argument. */
function emailedAbout(matchId: string, kind: EmailKind): string[] {
  return emailCalls()
    .filter(
      ([, , id, , , reminder]) =>
        id === matchId && (reminder === true) === (kind === "reminder"),
    )
    .map(([, nickname]) => nickname)
    .sort();
}

/**
 * Both email paths hand their work to `setImmediate` and return before any of
 * it has run, so a test has to wait for that deferred callback. Its only
 * observable effect is the stubbed `EmailService`: wait until the `expected`
 * emails have gone out **and** a quiet window has passed with no further one,
 * so an assertion can say what was not sent as well as what was.
 */
async function settledEmailsAbout(
  matchId: string,
  kind: EmailKind,
  expected: number,
): Promise<string[]> {
  const deadline = Date.now() + 15_000;
  let seen = -1;
  let quiet = 0;

  while (Date.now() < deadline) {
    const sent = emailCalls().length;
    quiet = sent === seen ? quiet + 1 : 0;
    seen = sent;
    if (
      emailedAbout(matchId, kind).length >= expected &&
      quiet >= QUIET_WINDOWS
    )
      break;
    await pause(QUIET_MS);
  }

  return emailedAbout(matchId, kind);
}

/** A Duel with voting on and four registered players, so everyone has an email to invite. */
async function duelWithVoting(options: { votingThreshold?: number } = {}) {
  const { user, dashboard } = await createUserWithDashboard();
  for (const nickname of ["Ana", "Bea", "Cal", "Dan"]) {
    await createRegisteredPlayer({ dashboardId: dashboard.id, nickname });
  }
  const { competition } = await createDuel({
    userId: user.id,
    votingEnabled: true,
    votingThreshold: options.votingThreshold,
  });

  return { user, dashboard, competition };
}

/**
 * Arms the Voting gate of a threshold-2 Duel: four Completed matches between
 * Ana and Cal is twice the threshold with both of them qualified, and leaves
 * Bea and Dan one match short. Waits for the invitations those matches defer,
 * so a test starts reading the email boundary once they are quiet.
 */
async function armGate(competitionId: string) {
  let last;
  for (let i = 0; i < 4; i++) {
    last = await createDuelMatch({
      competitionId,
      players: pair("Ana", "Cal"),
    });
  }
  await settledEmailsAbout(last!.id, "invitation", 2);
}

/** A match whose voting deadline is inside the Competition's reminder window. */
async function expiringMatch(
  competitionId: string,
  players?: createMatchRequest["players"],
) {
  const match = await createDuelMatch({ competitionId, players });
  await setVotingEndsAt(match.id, new Date(Date.now() + 24 * 60 * 60 * 1000));
  await settledEmailsAbout(match.id, "invitation", 0);
  return match;
}

beforeEach(() => {
  // Opening voting emails every player over SMTP: an external boundary, stubbed here.
  vi.spyOn(EmailService, "sendVotingInvitation").mockResolvedValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MatchVotingService voting invitations", () => {
  it("leaves a player the Voting gate blocks off the invitation", async () => {
    const { competition } = await duelWithVoting({ votingThreshold: 2 });
    await armGate(competition.id);

    // Bea's first match: the gate is armed and she is one match short of it.
    const match = await createDuelMatch({
      competitionId: competition.id,
      players: pair("Bea", "Cal"),
    });

    expect(await settledEmailsAbout(match.id, "invitation", 1)).toEqual([
      "Cal",
    ]);
  });

  it("invites every participant while the Competition is on the runway", async () => {
    const { competition } = await duelWithVoting({ votingThreshold: 3 });
    // The runway runs to six Completed matches, so nothing is gated yet.
    await createDuelMatch({
      competitionId: competition.id,
      players: pair("Ana", "Cal"),
    });

    const match = await createDuelMatch({
      competitionId: competition.id,
      players: pair("Bea", "Cal"),
    });

    expect(await settledEmailsAbout(match.id, "invitation", 2)).toEqual([
      "Bea",
      "Cal",
    ]);
  });

  it("invites every participant of a Competition with no threshold", async () => {
    const { competition } = await duelWithVoting();

    const match = await createDuelMatch({ competitionId: competition.id });

    expect(await settledEmailsAbout(match.id, "invitation", 4)).toEqual([
      "Ana",
      "Bea",
      "Cal",
      "Dan",
    ]);
  });

  it("invites a player whose qualifying match is the Duel just created", async () => {
    const { competition } = await duelWithVoting({ votingThreshold: 2 });
    await armGate(competition.id);
    const beasFirst = await createDuelMatch({
      competitionId: competition.id,
      players: pair("Bea", "Cal"),
    });
    expect(await settledEmailsAbout(beasFirst.id, "invitation", 1)).toEqual([
      "Cal",
    ]);

    // A Duel match is created Completed with its players inside one
    // transaction that then opens voting, so Bea's second match qualifies her
    // to vote on it — but only visibly so once that transaction has committed.
    const qualifying = await createDuelMatch({
      competitionId: competition.id,
      players: pair("Bea", "Cal"),
    });

    expect(await settledEmailsAbout(qualifying.id, "invitation", 2)).toEqual([
      "Bea",
      "Cal",
    ]);
  });
});

describe("MatchVotingService voting reminders", () => {
  it("leaves a player the Voting gate blocks off the reminder", async () => {
    const { competition } = await duelWithVoting({ votingThreshold: 2 });
    await armGate(competition.id);
    const match = await expiringMatch(competition.id, pair("Bea", "Cal"));

    await MatchVotingService.sendReminderEmails();

    expect(await settledEmailsAbout(match.id, "reminder", 1)).toEqual(["Cal"]);
  });

  it("reminds every participant while the Competition is still on the runway", async () => {
    // A threshold with the gate not yet armed: two Completed matches here plus
    // the expiring one — which is Completed the moment it is created, like
    // every Duel match — is three against a threshold of 2, one short of twice
    // it. Nobody is gated, and the sweep behaves as it does with no threshold.
    const { competition } = await duelWithVoting({ votingThreshold: 2 });
    for (let i = 0; i < 2; i++) {
      const runwayMatch = await createDuelMatch({
        competitionId: competition.id,
        players: pair("Ana", "Cal"),
      });
      await settledEmailsAbout(runwayMatch.id, "invitation", 2);
    }
    const match = await expiringMatch(competition.id, pair("Bea", "Dan"));

    await MatchVotingService.sendReminderEmails();

    expect(await settledEmailsAbout(match.id, "reminder", 2)).toEqual([
      "Bea",
      "Dan",
    ]);
  });

  it("reminds every participant of a Competition with no threshold", async () => {
    const { competition } = await duelWithVoting();
    const match = await expiringMatch(competition.id);

    await MatchVotingService.sendReminderEmails();

    expect(await settledEmailsAbout(match.id, "reminder", 4)).toEqual([
      "Ana",
      "Bea",
      "Cal",
      "Dan",
    ]);
  });

  it("loads eligibility once for matches spanning several Competitions", async () => {
    const competitions = [];
    for (let i = 0; i < 3; i++) {
      const { competition } = await duelWithVoting({ votingThreshold: 2 });
      await armGate(competition.id);
      competitions.push({
        id: competition.id,
        match: await expiringMatch(competition.id, pair("Bea", "Cal")),
      });
    }
    // Watched only from here: creating those matches loaded eligibility too.
    const loadMany = vi.spyOn(VotingEligibilityService, "loadMany");
    const load = vi.spyOn(VotingEligibilityService, "load");

    await MatchVotingService.sendReminderEmails();

    for (const { match } of competitions) {
      expect(await settledEmailsAbout(match.id, "reminder", 1)).toEqual([
        "Cal",
      ]);
    }
    // One load up front over the whole sweep, never one per match.
    expect(loadMany).toHaveBeenCalledTimes(1);
    expect(new Set(loadMany.mock.calls[0][0])).toEqual(
      new Set(competitions.map(({ id }) => id)),
    );
    expect(load).not.toHaveBeenCalled();
  });
});
