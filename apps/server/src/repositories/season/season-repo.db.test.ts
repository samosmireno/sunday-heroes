import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { createDuel, createUserWithDashboard } from "../../../test/factories";
import prisma from "../prisma-client";

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
