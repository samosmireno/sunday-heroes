import { describe, expect, it } from "vitest";
import { VotingStatus } from "@prisma/client";
import { MatchType } from "@repo/shared-types";
import { createMatchRequest } from "../schemas/create-match-request-schema";
import { transformAddMatchRequestToService } from "./match-transforms";

function request(
  overrides: Partial<createMatchRequest> = {},
): createMatchRequest {
  return {
    competitionId: "competition-1",
    date: "2026-09-07",
    matchType: MatchType.FIVE_A_SIDE,
    homeTeamScore: 2,
    awayTeamScore: 1,
    round: 1,
    teams: ["Home", "Away"],
    players: [
      {
        nickname: "Ana",
        goals: 1,
        assists: 0,
        position: 0,
        isHome: true,
      },
      {
        nickname: "Bo",
        goals: 1,
        assists: 0,
        position: 0,
        isHome: false,
      },
    ],
    ...overrides,
  };
}

describe("transformAddMatchRequestToService", () => {
  // A hardcoded interval here duplicated the admin's `votingPeriodDays`, and the
  // one that was here read as 5 days but was written in seconds against a
  // millisecond clock — about 7 minutes.
  it("leaves the voting end unset: only setupVoting computes one", () => {
    expect(
      transformAddMatchRequestToService(request()).votingEndsAt,
    ).toBeNull();
  });

  it("leaves it unset whether or not the competition has voting open", () => {
    expect(
      transformAddMatchRequestToService(request(), VotingStatus.OPEN)
        .votingEndsAt,
    ).toBeNull();
    expect(
      transformAddMatchRequestToService(request(), VotingStatus.CLOSED)
        .votingEndsAt,
    ).toBeNull();
  });

  it("still carries the competition's voting status, defaulting to CLOSED", () => {
    expect(
      transformAddMatchRequestToService(request(), VotingStatus.OPEN)
        .votingStatus,
    ).toBe(VotingStatus.OPEN);
    expect(transformAddMatchRequestToService(request()).votingStatus).toBe(
      VotingStatus.CLOSED,
    );
  });
});
