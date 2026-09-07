import { describe, expect, it } from "vitest";
import { CompetitionType } from "@repo/shared-types";
import { CreateCompetitionFormSchema } from "./create-competition-schema";

/** A Duel with voting on, as the form holds it: every number field starts "". */
const votingDuel = {
  name: "Sunday Night",
  type: CompetitionType.DUEL,
  votingEnabled: true,
  votingPeriodDays: 3,
  reminderDays: 2,
  isRoundRobin: false,
};

describe("CreateCompetitionFormSchema: votingThreshold", () => {
  it("validates an untouched field and produces no threshold, so the submit button stays enabled", () => {
    const result = CreateCompetitionFormSchema.safeParse({
      ...votingDuel,
      votingThreshold: "",
    });

    expect(result.success).toBe(true);
    expect(result.data?.votingThreshold).toBeUndefined();
    expect(result.data?.votingThreshold).not.toBe(0);
  });

  it("validates a form that carries no threshold field at all", () => {
    const result = CreateCompetitionFormSchema.safeParse(votingDuel);

    expect(result.success).toBe(true);
    expect(result.data?.votingThreshold).toBeUndefined();
  });

  it("accepts a threshold inside the 1-50 bounds", () => {
    expect(
      CreateCompetitionFormSchema.parse({ ...votingDuel, votingThreshold: 5 })
        .votingThreshold,
    ).toBe(5);
    expect(
      CreateCompetitionFormSchema.parse({ ...votingDuel, votingThreshold: "5" })
        .votingThreshold,
    ).toBe(5);
  });

  it("refuses 0, 51 and a fraction", () => {
    for (const votingThreshold of [0, 51, 2.5]) {
      expect(
        CreateCompetitionFormSchema.safeParse({
          ...votingDuel,
          votingThreshold,
        }).success,
      ).toBe(false);
    }
  });
});
