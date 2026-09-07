import { MatchType } from "@prisma/client";
import { CompetitionType } from "@repo/shared-types";
import { describe, expect, it } from "vitest";
import {
  createCompetitionRequestSchema,
  createNonLeagueCompetitionRequestSchema,
} from "./create-competition-request-schema";
import { createLeagueRequestSchema } from "./league-schemas";

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

describe("createCompetitionRequestSchema: votingThreshold", () => {
  it("drops an empty string rather than coercing it to 0", () => {
    const result = createCompetitionRequestSchema.parse({
      ...request,
      votingThreshold: "",
    });

    expect(result).toHaveProperty("votingThreshold", undefined);
    expect(result.votingThreshold).not.toBe(0);
  });

  it("accepts a request that carries no threshold at all", () => {
    const result = createCompetitionRequestSchema.parse(request);

    expect(result.votingThreshold).toBeUndefined();
  });

  it("accepts a threshold inside the 1-50 bounds", () => {
    expect(
      createCompetitionRequestSchema.parse({ ...request, votingThreshold: 5 })
        .votingThreshold,
    ).toBe(5);
    expect(
      createCompetitionRequestSchema.parse({ ...request, votingThreshold: "5" })
        .votingThreshold,
    ).toBe(5);
  });

  it("refuses 0, 51 and a fraction", () => {
    for (const votingThreshold of [0, 51, 2.5]) {
      expect(
        createCompetitionRequestSchema.safeParse({
          ...request,
          votingThreshold,
        }).success,
      ).toBe(false);
    }
  });

  it("is optional even when voting is enabled", () => {
    const result = createCompetitionRequestSchema.safeParse({
      ...request,
      votingEnabled: true,
      votingPeriodDays: 7,
      reminderDays: 3,
    });

    expect(result.success).toBe(true);
  });
});

describe("createLeagueRequestSchema: votingThreshold", () => {
  const leagueRequest = {
    ...request,
    matchType: MatchType.FIVE_A_SIDE,
    numberOfTeams: 4,
  };

  it("inherits the shared behaviour: empty is dropped, out of bounds is refused", () => {
    expect(
      createLeagueRequestSchema.parse({ ...leagueRequest, votingThreshold: "" })
        .votingThreshold,
    ).toBeUndefined();
    expect(
      createLeagueRequestSchema.parse({ ...leagueRequest, votingThreshold: 5 })
        .votingThreshold,
    ).toBe(5);
    expect(
      createLeagueRequestSchema.safeParse({
        ...leagueRequest,
        votingThreshold: 0,
      }).success,
    ).toBe(false);
  });
});
