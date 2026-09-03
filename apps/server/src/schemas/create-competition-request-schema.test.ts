import { CompetitionType } from "@repo/shared-types";
import { describe, expect, it } from "vitest";
import {
  createCompetitionRequestSchema,
  createNonLeagueCompetitionRequestSchema,
} from "./create-competition-request-schema";

const request = {
  userId: "user-1",
  name: "Sunday League",
  type: CompetitionType.LEAGUE,
  votingEnabled: false,
};

describe("createCompetitionRequestSchema", () => {
  it("accepts a competition with voting disabled and no voting periods", () => {
    expect(createCompetitionRequestSchema.safeParse(request).success).toBe(
      true,
    );
  });

  it("requires a voting period and a reminder once voting is enabled", () => {
    const result = createCompetitionRequestSchema.safeParse({
      ...request,
      votingEnabled: true,
    });

    expect(result.success).toBe(false);
  });

  it("requires the reminder to come before the voting period ends", () => {
    const result = createCompetitionRequestSchema.safeParse({
      ...request,
      votingEnabled: true,
      votingPeriodDays: 7,
      reminderDays: 7,
    });

    expect(result.success).toBe(false);
  });
});

describe("createNonLeagueCompetitionRequestSchema", () => {
  it("accepts a Duel", () => {
    const result = createNonLeagueCompetitionRequestSchema.safeParse({
      ...request,
      type: CompetitionType.DUEL,
    });

    expect(result.success).toBe(true);
  });

  it("refuses a League, which only POST /api/leagues creates", () => {
    expect(() =>
      createNonLeagueCompetitionRequestSchema.parse(request),
    ).toThrow("Leagues are created through POST /api/leagues");
  });
});
