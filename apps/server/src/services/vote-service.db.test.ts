import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "../repositories/prisma-client";
import {
  createDuel,
  createDuelMatch,
  createDuelWithClosedSeason,
  createRegisteredPlayer,
  createUserWithDashboard,
  defaultDuelPlayers,
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

describe("Voting closes on the votes just cast", () => {
  beforeEach(() => {
    vi.spyOn(EmailService, "sendVotingInvitation").mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** The default Duel squad in a fixed order, so every ballot below is deterministic. */
  const squad = defaultDuelPlayers.map((player) => player.nickname);
  const bySquadOrder = (a: { nickname: string }, b: { nickname: string }) =>
    squad.indexOf(a.nickname) - squad.indexOf(b.nickname);

  /** The match's participants as vote-casting ids, in squad order. */
  async function participantsOf(matchId: string) {
    const matchPlayers = await prisma.matchPlayer.findMany({
      where: { matchId },
      select: {
        dashboardPlayerId: true,
        dashboardPlayer: { select: { nickname: true } },
      },
    });

    return matchPlayers
      .sort((a, b) => bySquadOrder(a.dashboardPlayer, b.dashboardPlayer))
      .map((matchPlayer) => matchPlayer.dashboardPlayerId);
  }

  /**
   * One ballot from `voterId`, ranking the other three in squad order. Every voter
   * puts the same name top, so a closed match has a single man of the match. None of
   * the default players holds an account, so the competition ADMIN submits for them.
   */
  async function castBallot(
    matchId: string,
    voterId: string,
    adminUserId: string,
  ) {
    const ranked = (await VoteService.getVotingStatus(matchId, voterId)).players
      .filter((player) => player.canVoteFor)
      .sort(bySquadOrder);

    return VoteService.submitVotes(
      matchId,
      voterId,
      [
        { playerId: ranked[0].id, points: 3 },
        { playerId: ranked[1].id, points: 2 },
        { playerId: ranked[2].id, points: 1 },
      ],
      adminUserId,
    );
  }

  async function readMatch(matchId: string) {
    const match = await prisma.match.findUniqueOrThrow({
      where: { id: matchId },
      select: { votingStatus: true },
    });
    const players = await prisma.matchPlayer.findMany({
      where: { matchId },
      select: { rating: true, isMotm: true },
    });

    return { votingStatus: match.votingStatus, players };
  }

  async function votingDuelMatch() {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
    });
    const match = await createDuelMatch({ competitionId: competition.id });

    return { admin: user, match, voters: await participantsOf(match.id) };
  }

  it("closes and rates the match on the last participant's own submit", async () => {
    const { admin, match, voters } = await votingDuelMatch();
    const last = voters[voters.length - 1];

    for (const voter of voters.slice(0, -1)) {
      await castBallot(match.id, voter, admin.id);
    }
    // Still one ballot short: a close here would be one voter early.
    expect((await readMatch(match.id)).votingStatus).toBe("OPEN");

    await castBallot(match.id, last, admin.id);

    const { votingStatus, players } = await readMatch(match.id);
    expect(votingStatus).toBe("CLOSED");
    expect(players.filter((player) => player.rating !== null)).toHaveLength(4);
    expect(players.filter((player) => player.isMotm)).toHaveLength(1);
  });

  it("leaves the match open while more than one voter is outstanding", async () => {
    const { admin, match, voters } = await votingDuelMatch();

    await castBallot(match.id, voters[0], admin.id);
    await castBallot(match.id, voters[1], admin.id);

    const { votingStatus, players } = await readMatch(match.id);
    expect(votingStatus).toBe("OPEN");
    expect(players.filter((player) => player.rating !== null)).toHaveLength(0);
    expect(players.filter((player) => player.isMotm)).toHaveLength(0);
  });
});
