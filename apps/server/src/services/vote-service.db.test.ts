import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "../repositories/prisma-client";
import {
  createDuel,
  createDuelMatch,
  createDuelWithClosedSeason,
  createRegisteredPlayer,
  createUser,
  createUserWithDashboard,
  defaultDuelPlayers,
  findPlayerId,
} from "../../test/factories";
import { createMatchRequest } from "../schemas/create-match-request-schema";
import { AuthorizationError, VotingError } from "../utils/errors";
import { CompetitionService } from "./competition-service";
import { EmailService } from "./email-service";
import { MatchVotingService } from "./match/match-voting-service";
import { SeasonService } from "./season-service";
import { calculatePlayerScore } from "../utils/utils";
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

describe("The closing ballot counts toward the ratings it closes", () => {
  beforeEach(() => {
    vi.spyOn(EmailService, "sendVotingInvitation").mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const squad = defaultDuelPlayers.map((player) => player.nickname);
  const bySquadOrder = (a: { nickname: string }, b: { nickname: string }) =>
    squad.indexOf(a.nickname) - squad.indexOf(b.nickname);

  async function votingDuelMatch() {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
    });
    const match = await createDuelMatch({ competitionId: competition.id });
    const matchPlayers = await prisma.matchPlayer.findMany({
      where: { matchId: match.id },
      select: {
        dashboardPlayerId: true,
        dashboardPlayer: { select: { nickname: true } },
      },
    });
    const voters = matchPlayers
      .sort((a, b) => bySquadOrder(a.dashboardPlayer, b.dashboardPlayer))
      .map((matchPlayer) => matchPlayer.dashboardPlayerId);

    return { admin: user, match, voters };
  }

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

  /**
   * What every stored rating should be: `calculatePlayerScore` over the whole
   * committed ballot set. Recomputed rather than hardcoded so the assertion
   * survives a change to the scoring formula and still pins the vote set.
   */
  async function expectedRatings(matchId: string) {
    const allVotes = await prisma.playerVote.findMany({ where: { matchId } });
    const matchPlayers = await prisma.matchPlayer.findMany({
      where: { matchId },
      select: { id: true },
    });

    return {
      voteCount: allVotes.length,
      ratings: new Map(
        matchPlayers.map((matchPlayer) => [
          matchPlayer.id,
          calculatePlayerScore(
            allVotes.filter((vote) => vote.matchPlayerId === matchPlayer.id),
            allVotes,
          ),
        ]),
      ),
    };
  }

  async function storedRatings(matchId: string) {
    const matchPlayers = await prisma.matchPlayer.findMany({
      where: { matchId },
      select: { id: true, rating: true, isMotm: true },
    });

    return {
      ratings: new Map(
        matchPlayers.map((matchPlayer) => [matchPlayer.id, matchPlayer.rating]),
      ),
      motm: matchPlayers.filter((matchPlayer) => matchPlayer.isMotm),
    };
  }

  /** Every participant's `MatchPlayer` id, by nickname, for a ballot written by name. */
  async function ballotIds(matchId: string): Promise<Record<string, string>> {
    const matchPlayers = await prisma.matchPlayer.findMany({
      where: { matchId },
      select: { id: true, dashboardPlayer: { select: { nickname: true } } },
    });

    return Object.fromEntries(
      matchPlayers.map((matchPlayer) => [
        matchPlayer.dashboardPlayer.nickname,
        matchPlayer.id,
      ]),
    );
  }

  /**
   * A ballot written out by name, for the tests where the voters have to
   * disagree — `castBallot` ranks whoever is left in squad order, so every
   * voter it casts for puts the same player top.
   */
  async function castRankedBallot(
    matchId: string,
    voterId: string,
    points: Record<string, number>,
    ids: Record<string, string>,
    adminUserId: string,
  ) {
    return VoteService.submitVotes(
      matchId,
      voterId,
      Object.entries(points).map(([nickname, value]) => ({
        playerId: ids[nickname],
        points: value,
      })),
      adminUserId,
    );
  }

  it("rates the closing voter's own ballot into the match it closed", async () => {
    const { admin, match, voters } = await votingDuelMatch();

    for (const voter of voters) {
      await castBallot(match.id, voter, admin.id);
    }

    const expected = await expectedRatings(match.id);
    const stored = await storedRatings(match.id);
    // Every participant voted, so the whole squad's ballots are in.
    expect(expected.voteCount).toBe(voters.length * 3);
    expect(stored.ratings).toEqual(expected.ratings);
  });

  it("crowns the player the complete ballot set puts top, not the one three ballots did", async () => {
    const { admin, match, voters } = await votingDuelMatch();
    const ids = await ballotIds(match.id);

    // Chosen so the crown actually moves. After three ballots Bea leads on 6
    // points to Ana's 5; Dan's closing ballot puts Ana on 8 to Bea's 7. Reading
    // the match off a separate connection crowned Bea — the wrong player, and
    // permanently, because a CLOSED match is never recomputed.
    const ballots: Record<string, number>[] = [
      { Bea: 3, Cal: 2, Dan: 1 },
      { Ana: 3, Cal: 2, Dan: 1 },
      { Bea: 3, Ana: 2, Dan: 1 },
      { Ana: 3, Cal: 2, Bea: 1 },
    ];

    for (const [index, voter] of voters.entries()) {
      await castRankedBallot(match.id, voter, ballots[index], ids, admin.id);
    }

    const expected = await expectedRatings(match.id);
    const stored = await storedRatings(match.id);
    const best = Math.max(...expected.ratings.values());
    const winners = [...expected.ratings]
      .filter(([, rating]) => rating === best)
      .map(([matchPlayerId]) => matchPlayerId);

    expect(winners).toEqual([ids.Ana]);
    expect(stored.motm.map((matchPlayer) => matchPlayer.id)).toEqual([ids.Ana]);
  });

  it("rates on the nightly cron's path from every committed vote", async () => {
    const { admin, match, voters } = await votingDuelMatch();

    // Half the squad votes, then the deadline passes and the cron collects it.
    // This path opens no transaction, so it always saw the whole vote set — the
    // test guards that the `tx || prisma` fallback keeps it that way.
    await castBallot(match.id, voters[0], admin.id);
    await castBallot(match.id, voters[1], admin.id);
    await prisma.match.update({
      where: { id: match.id },
      data: { votingEndsAt: new Date(Date.now() - 1000) },
    });

    await MatchVotingService.closeExpiredVoting();

    const expected = await expectedRatings(match.id);
    const stored = await storedRatings(match.id);
    expect(expected.voteCount).toBe(6);
    expect(stored.ratings).toEqual(expected.ratings);
    expect(
      (await prisma.match.findUniqueOrThrow({ where: { id: match.id } }))
        .votingStatus,
    ).toBe("CLOSED");
  });
});

describe("The Voting gate refuses an ineligible voter at submit", () => {
  beforeEach(() => {
    vi.spyOn(EmailService, "sendVotingInvitation").mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** A Duel lineup from nicknames, numbered per side as the form numbers them. */
  function lineup(
    home: string[],
    away: string[],
  ): createMatchRequest["players"] {
    const side = (nicknames: string[], isHome: boolean) =>
      nicknames.map((nickname, index) => ({
        nickname,
        goals: 0,
        assists: 0,
        position: index + 1,
        isHome,
      }));

    return [...side(home, true), ...side(away, false)];
  }

  /** A full ballot from `voterId`: the other three participants, ranked by nickname. */
  async function ballot(matchId: string, voterId: string) {
    const others = await prisma.matchPlayer.findMany({
      where: { matchId, dashboardPlayerId: { not: voterId } },
      select: { id: true, dashboardPlayer: { select: { nickname: true } } },
    });
    const ranked = others.sort((a, b) =>
      a.dashboardPlayer.nickname.localeCompare(b.dashboardPlayer.nickname),
    );

    return [
      { playerId: ranked[0].id, points: 3 },
      { playerId: ranked[1].id, points: 2 },
      { playerId: ranked[2].id, points: 1 },
    ];
  }

  /** `voterId`'s ballot on `matchId`, submitted by `requestingUserId`. */
  async function submitBallot(
    matchId: string,
    voterId: string,
    requestingUserId: string,
  ) {
    return VoteService.submitVotes(
      matchId,
      voterId,
      await ballot(matchId, voterId),
      requestingUserId,
    );
  }

  /**
   * The gate's own refusal, pinned by its copy: `submitVotes` raises five other
   * `VotingError`s, and a test that accepted any of them would pass on a match
   * whose voting had merely closed.
   */
  async function expectGateRefusal(submission: Promise<unknown>) {
    const thrown = await submission.then(
      () => null,
      (error: unknown) => error,
    );

    expect(thrown).toBeInstanceOf(VotingError);
    expect((thrown as Error).message).toMatch(/voting threshold/i);
  }

  /**
   * A Duel with a threshold of 2 armed by four Completed matches, where Ana has
   * played every one of them and Bea only the last.
   */
  async function armedDuel() {
    const { user, dashboard } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
      votingThreshold: 2,
    });
    for (let i = 0; i < 3; i++) {
      await createDuelMatch({
        competitionId: competition.id,
        players: lineup(["Ana"], ["Cal"]),
      });
    }
    const match = await createDuelMatch({
      competitionId: competition.id,
      players: lineup(["Ana", "Bea"], ["Cal", "Dan"]),
    });
    const [ana, bea] = await Promise.all([
      findPlayerId(dashboard.id, "Ana"),
      findPlayerId(dashboard.id, "Bea"),
    ]);

    return { admin: user, dashboard, competition, match, ana, bea };
  }

  it("lets an unqualified participant vote on the runway and refuses them once the gate arms", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const bea = await createRegisteredPlayer({
      dashboardId: dashboard.id,
      nickname: "Bea",
    });
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
      votingThreshold: 3,
    });
    // Ana passes the threshold three times over; Bea plays two and never does.
    for (let i = 0; i < 3; i++) {
      await createDuelMatch({
        competitionId: competition.id,
        players: lineup(["Ana"], ["Cal"]),
      });
    }
    const first = await createDuelMatch({
      competitionId: competition.id,
      players: lineup(["Ana", "Bea"], ["Cal", "Dan"]),
    });
    const second = await createDuelMatch({
      competitionId: competition.id,
      players: lineup(["Ana", "Bea"], ["Cal", "Dan"]),
    });
    const voterId = bea.dashboardPlayer.id;

    // Five Completed matches against a threshold of 3: one short of arming, so
    // the runway is still on and every participant votes as though there were
    // no threshold.
    await expect(
      submitBallot(first.id, voterId, bea.user.id),
    ).resolves.toMatchObject({ success: true });

    // The sixth match arms the gate, and Bea is on two.
    await createDuelMatch({
      competitionId: competition.id,
      players: lineup(["Ana"], ["Cal"]),
    });

    await expectGateRefusal(submitBallot(second.id, voterId, bea.user.id));
  });

  it("counts qualification within one Season and never pools two", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const [ana, eve] = await Promise.all([
      createRegisteredPlayer({ dashboardId: dashboard.id, nickname: "Ana" }),
      createRegisteredPlayer({ dashboardId: dashboard.id, nickname: "Eve" }),
    ]);
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
      votingThreshold: 2,
    });

    // Season 1: Ana plays both matches and qualifies; Eve plays one.
    await createDuelMatch({
      competitionId: competition.id,
      players: lineup(["Ana", "Bea"], ["Cal", "Dan"]),
    });
    await createDuelMatch({
      competitionId: competition.id,
      players: lineup(["Ana", "Eve"], ["Cal", "Fay"]),
    });
    await SeasonService.startNewSeason(competition.id, user.id);

    // Season 2: one match each, so Eve ends on one per Season and Ana on one
    // this Season with her qualification earned in the closed one.
    const anasMatch = await createDuelMatch({
      competitionId: competition.id,
      players: lineup(["Ana", "Bea"], ["Cal", "Dan"]),
    });
    const evesMatch = await createDuelMatch({
      competitionId: competition.id,
      players: lineup(["Eve", "Bea"], ["Fay", "Dan"]),
    });

    // Four Completed matches against a threshold of 2, with Ana qualified: armed.
    await expect(
      submitBallot(anasMatch.id, ana.dashboardPlayer.id, ana.user.id),
    ).resolves.toMatchObject({ success: true });
    // Eve has played two, one in each Season, and one and one is not two.
    await expectGateRefusal(
      submitBallot(evesMatch.id, eve.dashboardPlayer.id, eve.user.id),
    );
  });

  it("refuses an ADMIN submitting on behalf of an ineligible player", async () => {
    const { admin, match, bea } = await armedDuel();

    await expectGateRefusal(submitBallot(match.id, bea, admin.id));
  });

  it("still lets an ADMIN submit on behalf of an Eligible voter", async () => {
    const { admin, match, ana } = await armedDuel();

    await expect(submitBallot(match.id, ana, admin.id)).resolves.toMatchObject({
      success: true,
    });
  });

  it("answers the gate's refusal rather than an authorization error, whoever is asking", async () => {
    const { match, bea } = await armedDuel();
    // Nobody here: not the voter's own account, not an ADMIN, not a MODERATOR.
    // The authorization check would refuse them on its own, so which error comes
    // back is what pins the gate ahead of it.
    const stranger = await createUser({ givenName: "Stranger" });

    const thrown = await submitBallot(match.id, bea, stranger.id).then(
      () => null,
      (error: unknown) => error,
    );

    expect(thrown).toBeInstanceOf(VotingError);
    expect(thrown).not.toBeInstanceOf(AuthorizationError);
  });

  it("disarms after Reset competition and lets every participant vote again", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const bea = await createRegisteredPlayer({
      dashboardId: dashboard.id,
      nickname: "Bea",
    });
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
      votingThreshold: 2,
    });
    for (let i = 0; i < 3; i++) {
      await createDuelMatch({
        competitionId: competition.id,
        players: lineup(["Ana"], ["Cal"]),
      });
    }
    const armedMatch = await createDuelMatch({
      competitionId: competition.id,
      players: lineup(["Ana", "Bea"], ["Cal", "Dan"]),
    });
    const voterId = bea.dashboardPlayer.id;
    await expectGateRefusal(submitBallot(armedMatch.id, voterId, bea.user.id));

    // Reset means this Competition never happened: every Match goes, the
    // qualification they carried goes with them, and the gate falls back to the
    // runway of a fresh Season 1.
    await CompetitionService.resetCompetition(competition.id, user.id);
    const resetMatch = await createDuelMatch({
      competitionId: competition.id,
      players: lineup(["Ana", "Bea"], ["Cal", "Dan"]),
    });

    await expect(
      submitBallot(resetMatch.id, voterId, bea.user.id),
    ).resolves.toMatchObject({ success: true });
  });
});

describe("The vote page's fourth state: a participant who cannot vote yet", () => {
  beforeEach(() => {
    vi.spyOn(EmailService, "sendVotingInvitation").mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** A Duel lineup from nicknames, numbered per side as the form numbers them. */
  function sides(
    home: string[],
    away: string[],
  ): createMatchRequest["players"] {
    const side = (nicknames: string[], isHome: boolean) =>
      nicknames.map((nickname, index) => ({
        nickname,
        goals: 0,
        assists: 0,
        position: index + 1,
        isHome,
      }));

    return [...side(home, true), ...side(away, false)];
  }

  /**
   * A Duel with a threshold of 2, armed by four Completed matches: Ana played
   * every one of them and is an Eligible voter, Bea only the last and is not.
   */
  async function armedDuelWithBlockedPlayer() {
    const { user, dashboard } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
      votingThreshold: 2,
    });
    for (let i = 0; i < 3; i++) {
      await createDuelMatch({
        competitionId: competition.id,
        players: sides(["Ana"], ["Cal"]),
      });
    }
    const match = await createDuelMatch({
      competitionId: competition.id,
      players: sides(["Ana", "Bea"], ["Cal", "Dan"]),
    });
    const [ana, bea] = await Promise.all([
      findPlayerId(dashboard.id, "Ana"),
      findPlayerId(dashboard.id, "Bea"),
    ]);

    return { user, dashboard, competition, match, ana, bea };
  }

  it("answers a blocked participant with the ballot and where they stand, not an error", async () => {
    const { match, bea } = await armedDuelWithBlockedPlayer();

    const status = await VoteService.getVotingStatus(match.id, bea);

    // The ballot is the one an Eligible voter gets, unchanged: the state the
    // client builds on this is a read-only ballot, not a refusal.
    expect(status.votingOpen).toBe(true);
    expect(status.hasVoted).toBe(false);
    expect(status.players).toHaveLength(4);
    expect(status.eligibility).toEqual({
      canVote: false,
      qualified: false,
      armed: true,
      threshold: 2,
      matchesThisSeason: 1,
      remaining: 1,
    });
    expect(status.seasonNumber).toBe(1);
  });

  it("still refuses a non-participant, unchanged", async () => {
    const { dashboard, match } = await armedDuelWithBlockedPlayer();
    // On the dashboard and never on this match. The read-only ballot is only
    // for someone who played, so this one keeps the refusal it always had.
    const zoe = await createRegisteredPlayer({
      dashboardId: dashboard.id,
      nickname: "Zoe",
    });

    const thrown = await VoteService.getVotingStatus(
      match.id,
      zoe.dashboardPlayer.id,
    ).then(
      () => null,
      (error: unknown) => error,
    );

    expect(thrown).toBeInstanceOf(VotingError);
    expect((thrown as Error).message).toMatch(/have not played in this match/i);
  });

  it("leaves an Eligible voter's ballot as it was, with the two new fields on it", async () => {
    const { match, ana } = await armedDuelWithBlockedPlayer();

    const status = await VoteService.getVotingStatus(match.id, ana);

    expect(status.matchId).toBe(match.id);
    expect(status.votingOpen).toBe(true);
    expect(status.hasVoted).toBe(false);
    // The viewer is on the ballot and cannot be voted for; the other three can.
    expect(status.players).toHaveLength(4);
    expect(status.players.filter((player) => player.canVoteFor)).toHaveLength(
      3,
    );
    expect(status.eligibility).toMatchObject({
      canVote: true,
      qualified: true,
      armed: true,
    });
    expect(status.seasonNumber).toBe(1);
  });

  it("reads as no gate at all in a Competition with no threshold", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
    });
    const match = await createDuelMatch({
      competitionId: competition.id,
      players: sides(["Ana", "Bea"], ["Cal", "Dan"]),
    });

    const status = await VoteService.getVotingStatus(
      match.id,
      await findPlayerId(dashboard.id, "Ana"),
    );

    expect(status.eligibility).toEqual({
      canVote: true,
      qualified: false,
      armed: false,
      threshold: null,
      matchesThisSeason: 1,
      remaining: 0,
    });
    expect(status.seasonNumber).toBe(1);
  });

  it("names the Current season even on a Past season's match", async () => {
    // Voting open when a Season closes runs on to its deadline, so this is
    // reachable — and the Season worth naming is the one the reader can still
    // earn their place in, not the one the match was played in.
    const { user, dashboard } = await createUserWithDashboard();
    const { seasonOneMatch } = await createDuelWithClosedSeason({
      userId: user.id,
      votingEnabled: true,
    });

    const status = await VoteService.getVotingStatus(
      seasonOneMatch.id,
      await findPlayerId(dashboard.id, defaultDuelPlayers[0].nickname),
    );

    expect(status.seasonNumber).toBe(2);
  });
});
