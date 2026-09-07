import { describe, expect, it } from "vitest";
import { CompetitionType, MatchType, VotingStatus } from "@prisma/client";
import { CompetitionBasic } from "../repositories/competition/types";
import { CompetitionMatch } from "../repositories/match/types";
import { extractDashboardData } from "./dashboard-transforms";
import {
  buildVotingEligibility,
  VotingEligibility,
} from "./voting-eligibility";
import { gate } from "../../test/voting-eligibility-fixtures";

const COMPETITION = "competition-1";
const OTHER = "competition-2";
const SEASON = "season-1";
const ANA = "player-ana";
const BEA = "player-bea";
const CAL = "player-cal";

function competition(id = COMPETITION): CompetitionBasic {
  return {
    id,
    name: `Competition ${id}`,
    type: CompetitionType.DUEL,
    votingEnabled: true,
  };
}

/** One Match of `competitionId`, with three participants and whoever has voted. */
function dashboardMatch(options: {
  id?: string;
  competitionId?: string;
  players?: string[];
  voted?: string[];
  votingStatus?: VotingStatus;
}): CompetitionMatch {
  const competitionId = options.competitionId ?? COMPETITION;

  return {
    id: options.id ?? "match-1",
    date: new Date("2026-01-10T00:00:00.000Z"),
    matchType: MatchType.FIVE_A_SIDE,
    round: 1,
    homeTeamScore: 2,
    awayTeamScore: 1,
    penaltyHomeScore: null,
    penaltyAwayScore: null,
    votingStatus: options.votingStatus ?? VotingStatus.OPEN,
    competition: {
      id: competitionId,
      name: `Competition ${competitionId}`,
      type: CompetitionType.DUEL,
    },
    matchTeams: [{ team: { name: "Home" } }, { team: { name: "Away" } }],
    matchPlayers: (options.players ?? [ANA, BEA, CAL]).map(
      (dashboardPlayerId) => ({ dashboardPlayerId }),
    ),
    playerVotes: (options.voted ?? []).map((voterId) => ({ voterId })),
  } as unknown as CompetitionMatch;
}

function eligibilitiesOf(
  eligibility: VotingEligibility,
  competitionId = COMPETITION,
) {
  return new Map([[competitionId, eligibility]]);
}

describe("extractDashboardData pending votes", () => {
  it("counts every non-voter in a Competition with no Voting threshold", () => {
    const data = extractDashboardData(
      [competition()],
      [dashboardMatch({ voted: [ANA] })],
      eligibilitiesOf(gate(null)),
    );

    expect(data.pendingVotes).toBe(2);
  });

  it("counts every non-voter during the runway, before the gate arms", () => {
    const runway = buildVotingEligibility({
      threshold: 5,
      completedMatchCount: 9, // one short of 2X
      currentSeason: { id: SEASON, number: 1 },
      participations: [{ dashboardPlayerId: ANA, seasonId: SEASON, count: 5 }],
    });

    const data = extractDashboardData(
      [competition()],
      [dashboardMatch({ voted: [ANA] })],
      eligibilitiesOf(runway),
    );

    expect(data.pendingVotes).toBe(2);
  });

  it("leaves out participants the armed gate would refuse", () => {
    const data = extractDashboardData(
      [competition()],
      [dashboardMatch({ voted: [ANA] })],
      eligibilitiesOf(gate(5, [ANA, BEA])),
    );

    // Ana has voted, Bea still may, Cal never will.
    expect(data.pendingVotes).toBe(1);
  });

  it("reads zero on a stranded match: open, with every Eligible voter done", () => {
    const data = extractDashboardData(
      [competition()],
      [dashboardMatch({ voted: [ANA] })],
      eligibilitiesOf(gate(5, [ANA])),
    );

    expect(data.pendingVotes).toBe(0);
  });

  it("judges each match by its own Competition's gate", () => {
    const data = extractDashboardData(
      [competition(), competition(OTHER)],
      [
        dashboardMatch({ voted: [ANA] }),
        dashboardMatch({ id: "match-2", competitionId: OTHER, voted: [ANA] }),
      ],
      new Map([
        [COMPETITION, gate(5, [ANA])],
        [OTHER, gate(null)],
      ]),
    );

    // Nothing pending in the gated Competition, both non-voters in the other.
    expect(data.pendingVotes).toBe(2);
  });

  it("ignores a match whose voting is not open, gate or no gate", () => {
    const data = extractDashboardData(
      [competition()],
      [dashboardMatch({ votingStatus: VotingStatus.CLOSED })],
      eligibilitiesOf(gate(null)),
    );

    expect(data.pendingVotes).toBe(0);
  });
});

describe("transformDashboardCompetitionsToResponse", () => {
  it("leaves the rest of the dashboard payload alone", () => {
    const data = extractDashboardData(
      [competition()],
      [dashboardMatch({ voted: [ANA] })],
      eligibilitiesOf(gate(5, [ANA])),
    );

    expect(data).toMatchObject({
      activeCompetitions: 1,
      totalPlayers: 3,
      completedMatches: 1,
      votingEnabled: true,
      competitions: [{ id: COMPETITION, matches: 1 }],
    });
    expect(data.matches).toHaveLength(1);
  });
});
