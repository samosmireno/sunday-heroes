/**
 * The one-off repair for the ratings the closing-ballot bug stored, run against
 * the state that bug produced. The SQL is read from the migration file itself,
 * so this test pins what ships rather than a copy of it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "../src/repositories/prisma-client";
import { EmailService } from "../src/services/email-service";
import { VoteService } from "../src/services/vote-service";
import { calculatePlayerScore } from "../src/utils/utils";
import {
  createDuel,
  createDuelMatch,
  createUserWithDashboard,
  defaultDuelPlayers,
  duelLineup,
} from "./factories";
import { migrationStatements } from "./migrations";

const REPAIR = "_closing_ballot_rating_repair";

/** Rows touched, named so a failing count says which statement moved. */
async function runRepair(): Promise<{ ratings: number; crowns: number }> {
  const statements = migrationStatements(REPAIR);
  if (statements.length !== 2) {
    throw new Error(`expected two statements, found ${statements.length}`);
  }

  return {
    ratings: await prisma.$executeRawUnsafe(statements[0]),
    crowns: await prisma.$executeRawUnsafe(statements[1]),
  };
}

/** `MatchPlayer` and `DashboardPlayer` ids for every participant, by nickname. */
async function participants(matchId: string) {
  const rows = await prisma.matchPlayer.findMany({
    where: { matchId },
    select: {
      id: true,
      dashboardPlayerId: true,
      dashboardPlayer: { select: { nickname: true } },
    },
  });

  return new Map(rows.map((row) => [row.dashboardPlayer.nickname, row]));
}

/**
 * What every stored rating should be: `calculatePlayerScore` over the match's
 * whole committed ballot set. Recomputed rather than hardcoded, so the
 * assertion pins the vote set and survives a change to the scoring formula.
 */
async function expectedRatings(matchId: string): Promise<Map<string, number>> {
  const votes = await prisma.playerVote.findMany({ where: { matchId } });
  const matchPlayers = await prisma.matchPlayer.findMany({
    where: { matchId },
    select: { id: true },
  });

  return new Map(
    matchPlayers.map((matchPlayer) => [
      matchPlayer.id,
      calculatePlayerScore(
        votes.filter((vote) => vote.matchPlayerId === matchPlayer.id),
        votes,
      ),
    ]),
  );
}

async function stored(matchId: string) {
  const rows = await prisma.matchPlayer.findMany({
    where: { matchId },
    select: { id: true, rating: true, isMotm: true },
    orderBy: { id: "asc" },
  });

  return {
    rows,
    ratings: new Map(rows.map((row) => [row.id, row.rating])),
    crowned: new Set(rows.filter((row) => row.isMotm).map((row) => row.id)),
  };
}

// Match creation sends the voting invitations.
beforeEach(() => {
  vi.spyOn(EmailService, "sendVotingInvitation").mockResolvedValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** A ballot, as `{ [nickname]: points }`. */
type Ballot = Record<string, number>;

describe("closing_ballot_rating_repair", () => {
  const squad = defaultDuelPlayers.map((player) => player.nickname);

  async function votingDuelMatch() {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
    });
    const match = await createDuelMatch({ competitionId: competition.id });
    const players = await participants(match.id);

    return {
      admin: user,
      match,
      players,
      /** The whole squad, in the order `defaultDuelPlayers` names them. */
      voters: squad.map((nickname) => players.get(nickname)!.dashboardPlayerId),
      id: (nickname: string) => players.get(nickname)!.id,
    };
  }

  type Duel = Awaited<ReturnType<typeof votingDuelMatch>>;

  async function castBallot(duel: Duel, voterId: string, ballot: Ballot) {
    return VoteService.submitVotes(
      duel.match.id,
      voterId,
      Object.entries(ballot).map(([nickname, points]) => ({
        playerId: duel.id(nickname),
        points,
      })),
      duel.admin.id,
    );
  }

  /**
   * The state a submit-time close left behind: every ballot but the last cast
   * through the service, the ratings computed from those, and only then the
   * closing ballot — written the way the buggy transaction wrote it, after the
   * read that should have counted it. The match is CLOSED, so nothing ever
   * recomputed the numbers.
   */
  async function closedOnTheLastBallot(ballots: Ballot[]) {
    const duel = await votingDuelMatch();

    for (const [index, voter] of duel.voters.slice(0, -1).entries()) {
      await castBallot(duel, voter, ballots[index]);
    }
    await VoteService.calculateAndStoreMatchRatings(duel.match.id);

    await prisma.playerVote.createMany({
      data: Object.entries(ballots[ballots.length - 1]).map(
        ([nickname, points]) => ({
          matchId: duel.match.id,
          voterId: duel.voters[duel.voters.length - 1],
          matchPlayerId: duel.id(nickname),
          points,
        }),
      ),
    });
    await prisma.match.update({
      where: { id: duel.match.id },
      data: { votingStatus: "CLOSED" },
    });

    return duel;
  }

  /** Every participant votes, in squad order: Ana ends on top either way. */
  const squadOrderBallots: Ballot[] = [
    { Bea: 3, Cal: 2, Dan: 1 },
    { Ana: 3, Cal: 2, Dan: 1 },
    { Ana: 3, Bea: 2, Dan: 1 },
    { Ana: 3, Bea: 2, Cal: 1 },
  ];

  it("recomputes a match rated from one ballot fewer, and leaves a correct one alone", async () => {
    const damaged = await closedOnTheLastBallot(squadOrderBallots);

    // The same squad, closed by the fixed code: every ballot counted, so these
    // rows are already what `calculatePlayerScore` returns and the repair has
    // nothing to write.
    const correct = await votingDuelMatch();
    for (const [index, voter] of correct.voters.entries()) {
      await castBallot(correct, voter, squadOrderBallots[index]);
    }
    const correctBefore = await stored(correct.match.id);

    // Nine ballots' worth of denominator on twelve ballots' worth of votes.
    const before = await stored(damaged.match.id);
    expect(before.ratings.get(damaged.id("Ana"))).toBe(2);
    expect(before.ratings.get(damaged.id("Dan"))).toBe(1);

    const repaired = await runRepair();

    const after = await stored(damaged.match.id);
    expect(after.ratings).toEqual(await expectedRatings(damaged.match.id));
    expect(after.ratings.get(damaged.id("Ana"))).toBe(2.25);
    expect(after.ratings.get(damaged.id("Dan"))).toBe(0.75);
    // Four rows on the damaged match, none on the correct one.
    expect(repaired).toEqual({ ratings: 4, crowns: 0 });
    expect(await stored(correct.match.id)).toEqual(correctBefore);
  });

  it("moves the crown to the player the whole ballot set puts top", async () => {
    // After three ballots Bea leads on 6 points to Ana's 5; the closing ballot
    // puts Ana on 8 to Bea's 7. The bug crowned Bea, and `markManOfTheMatch`
    // never clears a flag, so nothing has ever taken it off her.
    const duel = await closedOnTheLastBallot([
      { Bea: 3, Cal: 2, Dan: 1 },
      { Ana: 3, Cal: 2, Dan: 1 },
      { Bea: 3, Ana: 2, Dan: 1 },
      { Ana: 3, Cal: 2, Bea: 1 },
    ]);

    expect((await stored(duel.match.id)).crowned).toEqual(
      new Set([duel.id("Bea")]),
    );

    const repaired = await runRepair();

    const after = await stored(duel.match.id);
    expect(after.ratings).toEqual(await expectedRatings(duel.match.id));
    expect(after.crowned).toEqual(new Set([duel.id("Ana")]));
    // Ana gains the crown, Bea loses it: both rows, not just the winner's.
    expect(repaired).toEqual({ ratings: 4, crowns: 2 });
  });

  it("crowns both players when the recomputed maximum is a tie", async () => {
    // Three ballots put Ana top alone on 6; the closing ballot ties her with
    // Bea on 8. A tie is shared, not broken (CONTEXT.md, Man of the match).
    const duel = await closedOnTheLastBallot([
      { Bea: 3, Cal: 2, Dan: 1 },
      { Ana: 3, Cal: 2, Dan: 1 },
      { Ana: 3, Bea: 2, Dan: 1 },
      { Bea: 3, Ana: 2, Cal: 1 },
    ]);

    expect((await stored(duel.match.id)).crowned).toEqual(
      new Set([duel.id("Ana")]),
    );

    const repaired = await runRepair();

    const after = await stored(duel.match.id);
    expect(after.ratings).toEqual(await expectedRatings(duel.match.id));
    expect(after.crowned).toEqual(new Set([duel.id("Ana"), duel.id("Bea")]));
    expect(after.ratings.get(duel.id("Ana"))).toBe(2);
    expect(after.ratings.get(duel.id("Bea"))).toBe(2);
    // Ana's rating and crown both survive untouched: 6 of 9 and 8 of 12 are the
    // same number, and she still holds the maximum.
    expect(repaired).toEqual({ ratings: 3, crowns: 1 });
  });

  it("leaves a voteless match to the migration that owns it", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
    });
    const voteless = await createDuelMatch({ competitionId: competition.id });
    await prisma.match.update({
      where: { id: voteless.id },
      data: { votingStatus: "CLOSED" },
    });
    // The state `20260907104753_voteless_match_repair` already cleared. Setting
    // it back proves the scope boundary: a match with no ballots is that
    // migration's row to own, and this one never reaches it.
    await prisma.matchPlayer.updateMany({
      where: { matchId: voteless.id },
      data: { rating: 0, isMotm: true },
    });
    const before = await stored(voteless.id);

    expect(await runRepair()).toEqual({ ratings: 0, crowns: 0 });
    expect(await stored(voteless.id)).toEqual(before);
  });

  it("leaves a match still open for voting unrated", async () => {
    const duel = await votingDuelMatch();
    await castBallot(duel, duel.voters[0], squadOrderBallots[0]);

    // Votes are in, but the match is still OPEN and its ratings are null.
    // Rating it now would crown whoever leads mid-vote, and the crown would
    // stick: `markManOfTheMatch` only ever sets the flag, so the close that
    // follows would add the real winner without taking this one off.
    expect(await runRepair()).toEqual({ ratings: 0, crowns: 0 });

    const after = await stored(duel.match.id);
    expect(after.rows.every((row) => row.rating === null)).toBe(true);
    expect(after.crowned.size).toBe(0);
  });

  it("is idempotent", async () => {
    await closedOnTheLastBallot([
      { Bea: 3, Cal: 2, Dan: 1 },
      { Ana: 3, Cal: 2, Dan: 1 },
      { Bea: 3, Ana: 2, Dan: 1 },
      { Ana: 3, Cal: 2, Bea: 1 },
    ]);

    expect(await runRepair()).toEqual({ ratings: 4, crowns: 2 });
    expect(await runRepair()).toEqual({ ratings: 0, crowns: 0 });
  });
});

/**
 * The rounding, asserted rather than assumed. `calculatePlayerScore` divides in
 * IEEE doubles and rounds with `Math.round`; the migration has to land on the
 * same number for the same rows, because the stored value is what the client
 * reads — every transform is `player.rating ?? calculatePlayerScore(...)`, so
 * the column wins wherever it is populated.
 */
describe("closing_ballot_rating_repair writes what calculatePlayerScore returns", () => {
  /**
   * Ballot tables by squad size, chosen for the spread of (points received,
   * votes cast) pairs they produce. `ballots[v]` is what player `v` gave, as
   * `{ [player index]: points }`; nobody votes for themselves.
   */
  const SPREAD: { voters: number; ballots: Record<number, number>[] }[] = [
    // 12 votes cast; totals 9, 7, 5, 3 — the four-player Duel the bug was
    // measured on, where every rating divides exactly.
    {
      voters: 4,
      ballots: [
        { 1: 3, 2: 2, 3: 1 },
        { 0: 3, 2: 2, 3: 1 },
        { 0: 3, 1: 2, 3: 1 },
        { 0: 3, 1: 2, 2: 1 },
      ],
    },
    // 15 cast; totals 12, 9, 6, 3, 0. P4 is voted for by nobody, which is the
    // `COALESCE(..., 0)` case: an empty received set scores 0, not null.
    {
      voters: 5,
      ballots: [
        { 1: 3, 2: 2, 3: 1 },
        { 0: 3, 2: 2, 3: 1 },
        { 0: 3, 1: 2, 3: 1 },
        { 0: 3, 1: 2, 2: 1 },
        { 0: 3, 1: 2, 2: 1 },
      ],
    },
    // 18 cast; totals 4, 14, 10, 5, 1, 2 — every rating a repeating decimal.
    {
      voters: 6,
      ballots: [
        { 1: 3, 2: 2, 3: 1 },
        { 2: 3, 3: 2, 0: 1 },
        { 1: 3, 3: 2, 0: 1 },
        { 1: 3, 2: 2, 4: 1 },
        { 1: 3, 5: 2, 0: 1 },
        { 2: 3, 1: 2, 0: 1 },
      ],
    },
    // 24 cast; P0 on 5 points. That pair is the one that settles the rounding:
    // 5/24*3 is 0.625, which `Math.round` takes up to 0.63 and which a
    // `ROUND(numeric, 2)` over the same division takes down to 0.62.
    {
      voters: 8,
      ballots: [
        { 1: 3, 2: 2, 3: 1 },
        { 0: 3, 2: 2, 3: 1 },
        { 1: 3, 0: 2, 3: 1 },
        { 1: 3, 2: 2, 4: 1 },
        { 1: 3, 2: 2, 5: 1 },
        { 1: 3, 2: 2, 6: 1 },
        { 1: 3, 2: 2, 7: 1 },
        { 1: 3, 2: 2, 3: 1 },
      ],
    },
  ];

  /** `size` players named P0…, split evenly over the Duel's two sides. */
  function squadOf(size: number) {
    const nicknames = Array.from({ length: size }, (_, index) => `P${index}`);
    const half = Math.ceil(size / 2);

    return duelLineup(nicknames.slice(0, half), nicknames.slice(half));
  }

  it("agrees with the service over a spread of vote distributions", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
    });

    const matches: {
      id: string;
      players: Awaited<ReturnType<typeof participants>>;
    }[] = [];

    for (const { voters, ballots } of SPREAD) {
      const match = await createDuelMatch({
        competitionId: competition.id,
        players: squadOf(voters),
      });
      const players = await participants(match.id);
      const at = (index: number) => players.get(`P${index}`)!;

      // Written straight to the table: the ballots are the input to the
      // arithmetic under test, and going through the service would close the
      // match on its own terms rather than on the ones this test needs.
      await prisma.playerVote.createMany({
        data: ballots.flatMap((ballot, voter) =>
          Object.entries(ballot).map(([target, points]) => ({
            matchId: match.id,
            voterId: at(voter).dashboardPlayerId,
            matchPlayerId: at(Number(target)).id,
            points,
          })),
        ),
      });
      await prisma.match.update({
        where: { id: match.id },
        data: { votingStatus: "CLOSED" },
      });

      matches.push({ id: match.id, players });
    }

    const repaired = await runRepair();
    expect(repaired.ratings).toBe(
      SPREAD.reduce((sum, { voters }) => sum + voters, 0),
    );

    for (const match of matches) {
      expect((await stored(match.id)).ratings).toEqual(
        await expectedRatings(match.id),
      );
    }

    // The pair that would have gone the other way through exact decimal
    // arithmetic, named so a change to the expression has to argue with it.
    const eightPlayers = matches[matches.length - 1];
    expect(
      (await stored(eightPlayers.id)).ratings.get(
        eightPlayers.players.get("P0")!.id,
      ),
    ).toBe(0.63);
  });
});
