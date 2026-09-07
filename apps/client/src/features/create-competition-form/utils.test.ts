import { describe, expect, it } from "vitest";
import { CompetitionType } from "@repo/shared-types";
import { transformCompetitionFormToRequest } from "./utils";

describe("transformCompetitionFormToRequest", () => {
  it("sends a Duel without any season field", () => {
    const request = transformCompetitionFormToRequest(
      {
        name: "Zlatna lopta",
        type: CompetitionType.DUEL,
        votingEnabled: false,
        isRoundRobin: false,
      },
      "user-1",
    );

    expect(request).toEqual({
      userId: "user-1",
      type: CompetitionType.DUEL,
      name: "Zlatna lopta",
      votingEnabled: false,
      minPlayers: 4,
      isRoundRobin: false,
    });
  });

  it("sends the Voting threshold the admin chose", () => {
    const request = transformCompetitionFormToRequest(
      {
        name: "Sunday Night",
        type: CompetitionType.DUEL,
        votingEnabled: true,
        votingPeriodDays: 3,
        reminderDays: 2,
        votingThreshold: 5,
        isRoundRobin: false,
      },
      "user-1",
    );

    expect(request.votingThreshold).toBe(5);
  });

  it("sends no threshold field when the admin left it empty", () => {
    const request = transformCompetitionFormToRequest(
      {
        name: "Sunday Night",
        type: CompetitionType.DUEL,
        votingEnabled: true,
        votingPeriodDays: 3,
        reminderDays: 2,
        isRoundRobin: false,
      },
      "user-1",
    );

    expect(request.votingThreshold).toBeUndefined();
    expect(request).not.toHaveProperty("votingThreshold", 0);
  });
});
