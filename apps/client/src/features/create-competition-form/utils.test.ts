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
});
