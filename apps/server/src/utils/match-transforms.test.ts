import { describe, expect, it } from "vitest";
import { CompetitionType, VotingStatus } from "@prisma/client";
import { MatchType } from "@repo/shared-types";
import { MatchWithDetails } from "../repositories/match/types";
import { createMatchRequest } from "../schemas/create-match-request-schema";
import {
  transformAddMatchRequestToService,
  transformMatchesToMatchesResponse,
} from "./match-transforms";
import { VotingEligibility } from "./voting-eligibility";
import { gate } from "../../test/voting-eligibility-fixtures";

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

const COMPETITION = "competition-1";
const ADMIN = "user-admin";
const ANA = "player-ana";
const BEA = "player-bea";
const CAL = "player-cal";
// The accounts behind two of the players. Cal is an unregistered player: a
// nickname on the dashboard with nobody signed in behind it.
const ANA_USER = "user-ana";
const BEA_USER = "user-bea";
// An account on none of the page's matches.
const STRANGER = "user-dee";

/** One Duel Match with Ana and Bea at home, Cal away, and whoever has voted. */
function matchOnThePage(
  options: {
    voted?: string[];
    competitionId?: string;
    admin?: string;
    /** Bea's row: the same account is a different player on each dashboard. */
    bea?: { id: string; userId: string | null };
  } = {},
): MatchWithDetails {
  const player = (
    id: string,
    nickname: string,
    isHome: boolean,
    position: number,
    userId: string | null,
  ) => ({
    dashboardPlayerId: id,
    dashboardPlayer: { id, nickname, userId },
    isHome,
    goals: 1,
    assists: 0,
    position,
    rating: 2.5,
    isMotm: false,
    receivedVotes: [],
  });

  return {
    id: "match-1",
    competitionId: options.competitionId ?? COMPETITION,
    date: new Date("2026-01-10T00:00:00.000Z"),
    matchType: MatchType.FIVE_A_SIDE,
    round: 1,
    homeTeamScore: 2,
    awayTeamScore: 1,
    penaltyHomeScore: null,
    penaltyAwayScore: null,
    votingStatus: VotingStatus.OPEN,
    votingEndsAt: null,
    videoUrl: null,
    season: { number: 1, endedAt: null },
    matchTeams: [{ team: { name: "Home" } }, { team: { name: "Away" } }],
    matchPlayers: [
      player(ANA, "Ana", true, 1, ANA_USER),
      player(
        options.bea?.id ?? BEA,
        "Bea",
        true,
        2,
        options.bea === undefined ? BEA_USER : options.bea.userId,
      ),
      player(CAL, "Cal", false, 1, null),
    ],
    playerVotes: (options.voted ?? []).map((voterId) => ({ voterId })),
    competition: {
      id: options.competitionId ?? COMPETITION,
      name: "Zlatna lopta",
      type: CompetitionType.DUEL,
      votingEnabled: true,
      dashboard: { adminId: options.admin ?? ADMIN },
    },
  } as unknown as MatchWithDetails;
}

function eligibilitiesOf(
  eligibility: VotingEligibility,
  competitionId = COMPETITION,
) {
  return new Map([[competitionId, eligibility]]);
}

describe("transformMatchesToMatchesResponse", () => {
  it("puts the viewer's own standing on every match of the page", () => {
    const [response] = transformMatchesToMatchesResponse(
      BEA_USER,
      [matchOnThePage()],
      eligibilitiesOf(gate(5, [ANA])),
    );

    expect(response.viewerEligibility).toEqual({
      canVote: false,
      qualified: false,
      armed: true,
      threshold: 5,
      matchesThisSeason: 0,
      remaining: 5,
    });
  });

  it("answers for a viewer who is nobody on this match, rather than leaving the record off", () => {
    const [response] = transformMatchesToMatchesResponse(
      ADMIN,
      [matchOnThePage()],
      eligibilitiesOf(gate(5, [ANA])),
    );

    // An admin who has never been put on a match has played nothing, which is
    // what a total `for()` answers for an id it has never seen.
    expect(response.viewerEligibility).toMatchObject({
      canVote: false,
      qualified: false,
      matchesThisSeason: 0,
    });
    expect(response.isAdmin).toBe(true);
  });

  it("says whether the viewer was on the match", () => {
    const [played] = transformMatchesToMatchesResponse(
      BEA_USER,
      [matchOnThePage()],
      eligibilitiesOf(gate(5, [ANA])),
    );
    const [watched] = transformMatchesToMatchesResponse(
      STRANGER,
      [matchOnThePage()],
      eligibilitiesOf(gate(5, [ANA])),
    );

    expect(played.viewerPlayed).toBe(true);
    expect(watched.viewerPlayed).toBe(false);
  });

  it("puts nobody on a match they were never on", () => {
    // A viewer who is on none of this Match's players played nothing here, so
    // the question of whether they played it answers itself.
    const [response] = transformMatchesToMatchesResponse(
      ADMIN,
      [matchOnThePage()],
      eligibilitiesOf(gate(5, [ANA])),
    );

    expect(response.viewerPlayed).toBe(false);
  });

  it("reads the viewer's player off each Match, so a page can span dashboards", () => {
    // The user-wide list carries every Match this account played, wherever it
    // was played, and one account is a different dashboard player on each
    // dashboard. One identity resolved for the whole page is wrong on all but
    // one of them: here it qualifies on both, under two different rows.
    const elsewhere = "competition-2";
    const beaElsewhere = "player-bea-elsewhere";
    const eligibilities = new Map([
      [COMPETITION, gate(5, [BEA])],
      [elsewhere, gate(5, [beaElsewhere])],
    ]);

    const [here, there] = transformMatchesToMatchesResponse(
      BEA_USER,
      [
        matchOnThePage(),
        matchOnThePage({
          competitionId: elsewhere,
          bea: { id: beaElsewhere, userId: BEA_USER },
        }),
      ],
      eligibilities,
    );

    expect(here.viewerPlayed).toBe(true);
    expect(here.viewerEligibility.qualified).toBe(true);
    expect(there.viewerPlayed).toBe(true);
    expect(there.viewerEligibility.qualified).toBe(true);
  });

  it("leaves an unregistered player nobody: a nickname with no account behind it", () => {
    // Cal has no `userId`. Nothing may match him, and least of all a viewer
    // whose own account is unset on some other row.
    const [response] = transformMatchesToMatchesResponse(
      STRANGER,
      [matchOnThePage({ bea: { id: BEA, userId: null } })],
      eligibilitiesOf(gate(5, [ANA])),
    );

    expect(response.viewerPlayed).toBe(false);
  });

  it("takes the eligibility of each match's own Competition", () => {
    const other = "competition-2";
    const eligibilities = new Map([
      [COMPETITION, gate(5, [ANA])],
      [other, gate(null)],
    ]);

    const [gated, ungated] = transformMatchesToMatchesResponse(
      BEA_USER,
      [matchOnThePage(), matchOnThePage({ competitionId: other })],
      eligibilities,
    );

    expect(gated.viewerEligibility.canVote).toBe(false);
    expect(ungated.viewerEligibility.canVote).toBe(true);
  });

  it("counts as pending only the non-voters the gate would accept", () => {
    const [response] = transformMatchesToMatchesResponse(
      ANA_USER,
      [matchOnThePage({ voted: [ANA] })],
      eligibilitiesOf(gate(5, [ANA, BEA])),
    );

    // Ana has voted, Bea still may, Cal never will.
    expect(response.pendingVotes).toBe(1);
  });

  it("is byte-identical to the pre-gate response for a Competition with no threshold", () => {
    // An admin who also plays: one response carrying both identities.
    const [response] = transformMatchesToMatchesResponse(
      BEA_USER,
      [matchOnThePage({ voted: [ANA], admin: BEA_USER })],
      eligibilitiesOf(gate(null)),
    );

    expect(response).toEqual({
      id: "match-1",
      date: "2026-01-10",
      teams: ["Home", "Away"],
      scores: [2, 1],
      penaltyScores: undefined,
      matchType: MatchType.FIVE_A_SIDE,
      votingEnabled: true,
      votingStatus: VotingStatus.OPEN,
      votingEndsAt: undefined,
      playerCount: 3,
      // Every non-voter still counts: no threshold, no filter.
      pendingVotes: 2,
      viewerEligibility: {
        canVote: true,
        qualified: false,
        armed: false,
        threshold: null,
        matchesThisSeason: 0,
        remaining: 0,
      },
      viewerPlayed: true,
      playerStats: [
        {
          id: ANA,
          nickname: "Ana",
          position: 1,
          goals: 1,
          assists: 0,
          isHome: true,
          rating: 2.5,
          manOfTheMatch: false,
        },
        {
          id: BEA,
          nickname: "Bea",
          position: 2,
          goals: 1,
          assists: 0,
          isHome: true,
          rating: 2.5,
          manOfTheMatch: false,
        },
        {
          id: CAL,
          nickname: "Cal",
          position: 1,
          goals: 1,
          assists: 0,
          isHome: false,
          rating: 2.5,
          manOfTheMatch: false,
        },
      ],
      competitionId: COMPETITION,
      competitionName: "Zlatna lopta",
      competitionType: CompetitionType.DUEL,
      isAdmin: true,
      videoUrl: undefined,
      season: { number: 1, isClosed: false },
    });
  });
});
