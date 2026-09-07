import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "../repositories/prisma-client";
import {
  createDuel,
  createDuelMatch,
  createDuelWithClosedSeason,
  createRegisteredPlayer,
  createUserWithDashboard,
} from "../../test/factories";
import { EmailService } from "./email-service";
import { VoteService } from "./vote-service";

describe("Voting is not a Match write (ADR 0002)", () => {
  // Creating a Match with voting enabled sends the invitation to every player
  // with an email, over SMTP: an external boundary, stubbed here.
  beforeEach(() => {
    vi.spyOn(EmailService, "sendVotingInvitation").mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts a vote on a Season-1 Match whose voting is still open after the rollover", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    // Ana, one of the default Duel players, has an account and votes as herself.
    const ana = await createRegisteredPlayer({
      dashboardId: dashboard.id,
      nickname: "Ana",
    });
    const { seasonOneMatch } = await createDuelWithClosedSeason({
      userId: user.id,
      votingEnabled: true,
    });
    const voterId = ana.dashboardPlayer.id;
    const before = await VoteService.getVotingStatus(
      seasonOneMatch.id,
      voterId,
    );
    expect(before).toMatchObject({ votingOpen: true, hasVoted: false });
    const [first, second, third] = before.players.filter(
      (player) => player.canVoteFor,
    );

    const result = await VoteService.submitVotes(
      seasonOneMatch.id,
      voterId,
      [
        { playerId: first.id, points: 3 },
        { playerId: second.id, points: 2 },
        { playerId: third.id, points: 1 },
      ],
      ana.user.id,
    );

    expect(result.success).toBe(true);
    expect(
      (await VoteService.getVotingStatus(seasonOneMatch.id, voterId)).hasVoted,
    ).toBe(true);
  });
});

describe("Closing a match nobody voted on", () => {
  beforeEach(() => {
    vi.spyOn(EmailService, "sendVotingInvitation").mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** What the nightly `closeExpiredVoting` cron does to each expired match. */
  async function closeAtTheDeadline(matchId: string) {
    await VoteService.calculateAndStoreMatchRatings(matchId);
    return prisma.matchPlayer.findMany({
      where: { matchId },
      select: { rating: true, isMotm: true },
    });
  }

  it("rates nobody and crowns nobody", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
    });
    const match = await createDuelMatch({ competitionId: competition.id });

    const players = await closeAtTheDeadline(match.id);

    expect(players).toHaveLength(4);
    // `null` is "never rated"; a stored 0 would read as "rated and received
    // nothing" and would make every player the joint maximum.
    for (const player of players) {
      expect(player).toEqual({ rating: null, isMotm: false });
    }
  });

  it("still rates and crowns when a vote was cast", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const ana = await createRegisteredPlayer({
      dashboardId: dashboard.id,
      nickname: "Ana",
    });
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
    });
    const match = await createDuelMatch({ competitionId: competition.id });
    const voterId = ana.dashboardPlayer.id;
    const ballot = (
      await VoteService.getVotingStatus(match.id, voterId)
    ).players.filter((player) => player.canVoteFor);

    await VoteService.submitVotes(
      match.id,
      voterId,
      [
        { playerId: ballot[0].id, points: 3 },
        { playerId: ballot[1].id, points: 2 },
        { playerId: ballot[2].id, points: 1 },
      ],
      ana.user.id,
    );
    const players = await closeAtTheDeadline(match.id);

    expect(players.filter((player) => player.isMotm)).toHaveLength(1);
    expect(players.filter((player) => player.rating !== null)).toHaveLength(4);
  });
});
