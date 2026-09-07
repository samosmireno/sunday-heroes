/**
 * The one-off repair migration, run against the state the live MOTM bug produced.
 * The SQL is read from the migration file itself, so this test pins what ships
 * rather than a copy of it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import prisma from "../src/repositories/prisma-client";
import { EmailService } from "../src/services/email-service";
import { VoteService } from "../src/services/vote-service";
import {
  createDuel,
  createDuelMatch,
  createRegisteredPlayer,
  createUserWithDashboard,
} from "./factories";
import { migrationSql } from "./migrations";

const runRepair = () =>
  prisma.$executeRawUnsafe(migrationSql("_voteless_match_repair"));

const ratingsFor = (matchId: string) =>
  prisma.matchPlayer.findMany({
    where: { matchId },
    orderBy: { position: "asc" },
    select: { rating: true, isMotm: true },
  });

describe("voteless_match_repair", () => {
  beforeEach(() => {
    vi.spyOn(EmailService, "sendVotingInvitation").mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("clears the whole squad the bug crowned, and leaves a voted match alone", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const ana = await createRegisteredPlayer({
      dashboardId: dashboard.id,
      nickname: "Ana",
    });
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
    });

    const voteless = await createDuelMatch({ competitionId: competition.id });
    // The damage: `calculatePlayerScore` stored 0 for everyone, then the 0
    // maximum matched every row.
    await prisma.matchPlayer.updateMany({
      where: { matchId: voteless.id },
      data: { rating: 0, isMotm: true },
    });

    const voted = await createDuelMatch({ competitionId: competition.id });
    const voterId = ana.dashboardPlayer.id;
    const ballot = (
      await VoteService.getVotingStatus(voted.id, voterId)
    ).players.filter((player) => player.canVoteFor);
    await VoteService.submitVotes(
      voted.id,
      voterId,
      [
        { playerId: ballot[0].id, points: 3 },
        { playerId: ballot[1].id, points: 2 },
        { playerId: ballot[2].id, points: 1 },
      ],
      ana.user.id,
    );
    await VoteService.calculateAndStoreMatchRatings(voted.id);
    const votedBefore = await ratingsFor(voted.id);

    const repaired = await runRepair();

    expect(repaired).toBe(4);
    for (const player of await ratingsFor(voteless.id)) {
      expect(player).toEqual({ rating: null, isMotm: false });
    }
    expect(await ratingsFor(voted.id)).toEqual(votedBefore);
    expect(votedBefore.filter((player) => player.isMotm)).toHaveLength(1);
  });

  it("is a no-op on rows that are already null and false", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: false,
    });
    // A voting-disabled competition never ran the rating calculation, so its
    // rows were already `rating: null, isMotm: false`.
    await createDuelMatch({ competitionId: competition.id });

    expect(await runRepair()).toBe(0);
  });

  it("is idempotent", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
    });
    const match = await createDuelMatch({ competitionId: competition.id });
    await prisma.matchPlayer.updateMany({
      where: { matchId: match.id },
      data: { rating: 0, isMotm: true },
    });

    expect(await runRepair()).toBe(4);
    expect(await runRepair()).toBe(0);
  });
});
