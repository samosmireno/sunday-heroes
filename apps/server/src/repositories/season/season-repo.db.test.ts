import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  createDuel,
  createDuelWithClosedSeason,
  createUserWithDashboard,
} from "../../../test/factories";
import prisma from "../prisma-client";
import { SeasonRepo } from "./season-repo";

// The partial unique index on Season(competitionId) WHERE endedAt IS NULL is custom
// SQL the Prisma schema cannot declare. This test is the only guard against a
// future migration dropping it (ADR 0001).
describe("Season_one_open_per_competition_key (one open Season per Competition)", () => {
  it("refuses a raw insert of a second open Season with unique violation 23505", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({ userId: user.id });

    const insert = prisma.$executeRaw`
      INSERT INTO "Season" ("id", "competitionId", "number", "startedAt", "endedAt")
      VALUES (${"second-open-season"}, ${competition.id}, 2, NOW(), NULL)
    `;

    await expect(insert).rejects.toSatisfy(
      (error) =>
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.meta?.code === "23505",
    );
  });
});

describe("SeasonRepo.close", () => {
  it("closes the open Season once and reports 0 rows on a Season already closed", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({ userId: user.id });
    const current = await SeasonRepo.findCurrent(competition.id);
    const endedAt = new Date("2026-03-01T12:00:00.000Z");

    expect(await SeasonRepo.close(current!.id, endedAt)).toBe(1);
    expect(await SeasonRepo.close(current!.id, new Date())).toBe(0);

    expect(await SeasonRepo.findCurrent(competition.id)).toBeNull();
    expect(await SeasonRepo.listWithCounts(competition.id)).toEqual([
      expect.objectContaining({ number: 1, endedAt }),
    ]);
  });
});

describe("SeasonRepo.findCurrentMany", () => {
  it("keys the Current season by Competition and leaves out one with none", async () => {
    const { user } = await createUserWithDashboard();
    const [rolledOver, fresh, closed] = await Promise.all([
      createDuelWithClosedSeason({ userId: user.id, name: "Rolled over" }),
      createDuel({ userId: user.id, name: "Fresh" }),
      createDuel({ userId: user.id, name: "Closed" }),
    ]);
    const closedSeason = await SeasonRepo.findCurrent(closed.competition.id);
    await SeasonRepo.close(closedSeason!.id, new Date());

    const currentSeasons = await SeasonRepo.findCurrentMany([
      rolledOver.competition.id,
      fresh.competition.id,
      closed.competition.id,
    ]);

    expect(currentSeasons.get(rolledOver.competition.id)?.number).toBe(2);
    expect(currentSeasons.get(fresh.competition.id)?.number).toBe(1);
    expect(currentSeasons.has(closed.competition.id)).toBe(false);
  });

  it("returns an empty map for an empty list of Competitions", async () => {
    expect(await SeasonRepo.findCurrentMany([])).toEqual(new Map());
  });
});
