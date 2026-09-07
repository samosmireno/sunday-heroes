import { describe, expect, it } from "vitest";
import { buildVotingEligibility } from "./voting-eligibility";

const SEASON_1 = "season-1";
const SEASON_2 = "season-2";
const ANA = "player-ana";
const BEA = "player-bea";

/** Season 2 is the Current season in every test that has one. */
const currentSeason = { id: SEASON_2, number: 2 };

function played(dashboardPlayerId: string, seasonId: string, count: number) {
  return { dashboardPlayerId, seasonId, count };
}

describe("buildVotingEligibility without a threshold", () => {
  it("lets everyone vote, qualifies nobody and asks for nothing", () => {
    const eligibility = buildVotingEligibility({
      threshold: null,
      completedMatchCount: 40,
      currentSeason,
      participations: [played(ANA, SEASON_2, 12)],
    });

    expect(eligibility.armed).toBe(false);
    expect(eligibility.for(ANA)).toEqual({
      canVote: true,
      qualified: false,
      armed: false,
      threshold: null,
      matchesThisSeason: 12,
      remaining: 0,
    });
  });

  it("reports no threshold for a player who has never played either", () => {
    const eligibility = buildVotingEligibility({
      threshold: null,
      completedMatchCount: 0,
      currentSeason,
      participations: [],
    });

    expect(eligibility.for(BEA)).toEqual({
      canVote: true,
      qualified: false,
      armed: false,
      threshold: null,
      matchesThisSeason: 0,
      remaining: 0,
    });
  });
});

describe("buildVotingEligibility counts qualification per Season", () => {
  it("does not pool Seasons: four and four is not eight", () => {
    const eligibility = buildVotingEligibility({
      threshold: 5,
      completedMatchCount: 20,
      currentSeason,
      participations: [played(ANA, SEASON_1, 4), played(ANA, SEASON_2, 4)],
    });

    expect(eligibility.for(ANA).qualified).toBe(false);
  });

  it("qualifies on five in one Season", () => {
    const eligibility = buildVotingEligibility({
      threshold: 5,
      completedMatchCount: 20,
      currentSeason,
      participations: [played(ANA, SEASON_1, 1), played(ANA, SEASON_2, 5)],
    });

    expect(eligibility.for(ANA).qualified).toBe(true);
  });

  it("qualifies on a Season that is not the Current one", () => {
    const eligibility = buildVotingEligibility({
      threshold: 3,
      completedMatchCount: 20,
      currentSeason,
      participations: [played(ANA, SEASON_1, 3)],
    });

    expect(eligibility.for(ANA).qualified).toBe(true);
  });
});

describe("buildVotingEligibility arms on both conditions", () => {
  // Threshold 5, so the runway is the first 2 * 5 = 10 Completed matches.
  const runwayCases = [
    { completedMatchCount: 9, label: "one below twice the threshold" },
    { completedMatchCount: 10, label: "exactly twice the threshold" },
    { completedMatchCount: 11, label: "one above twice the threshold" },
  ];

  for (const { completedMatchCount, label } of runwayCases) {
    it(`stays disarmed at ${label} when nobody is qualified`, () => {
      const eligibility = buildVotingEligibility({
        threshold: 5,
        completedMatchCount,
        currentSeason,
        participations: [played(ANA, SEASON_2, 4)],
      });

      expect(eligibility.armed).toBe(false);
      expect(eligibility.for(ANA).canVote).toBe(true);
      expect(eligibility.for(ANA).armed).toBe(false);
    });
  }

  it("stays disarmed one below twice the threshold even with a qualified player", () => {
    const eligibility = buildVotingEligibility({
      threshold: 5,
      completedMatchCount: 9,
      currentSeason,
      participations: [played(ANA, SEASON_2, 5), played(BEA, SEASON_2, 2)],
    });

    expect(eligibility.armed).toBe(false);
    expect(eligibility.for(BEA).canVote).toBe(true);
  });

  it("arms at exactly twice the threshold with a qualified player", () => {
    const eligibility = buildVotingEligibility({
      threshold: 5,
      completedMatchCount: 10,
      currentSeason,
      participations: [played(ANA, SEASON_2, 5), played(BEA, SEASON_2, 2)],
    });

    expect(eligibility.armed).toBe(true);
    expect(eligibility.for(ANA).canVote).toBe(true);
    expect(eligibility.for(BEA).canVote).toBe(false);
    expect(eligibility.for(BEA).armed).toBe(true);
  });

  it("stays armed one above twice the threshold with a qualified player", () => {
    const eligibility = buildVotingEligibility({
      threshold: 5,
      completedMatchCount: 11,
      currentSeason,
      participations: [played(ANA, SEASON_2, 6), played(BEA, SEASON_2, 2)],
    });

    expect(eligibility.armed).toBe(true);
    expect(eligibility.for(BEA).canVote).toBe(false);
  });

  it("never arms without a threshold, however many matches were played", () => {
    const eligibility = buildVotingEligibility({
      threshold: null,
      completedMatchCount: 500,
      currentSeason,
      participations: [played(ANA, SEASON_2, 100)],
    });

    expect(eligibility.armed).toBe(false);
  });
});

describe("buildVotingEligibility on the runway", () => {
  it("lets a player with no matches at all vote before the gate arms", () => {
    const eligibility = buildVotingEligibility({
      threshold: 4,
      completedMatchCount: 7,
      currentSeason,
      participations: [played(ANA, SEASON_2, 4)],
    });

    expect(eligibility.armed).toBe(false);
    expect(eligibility.for(BEA)).toEqual({
      canVote: true,
      qualified: false,
      armed: false,
      threshold: 4,
      matchesThisSeason: 0,
      remaining: 4,
    });
  });
});

describe("buildVotingEligibility keeps qualification permanent", () => {
  it("still lets a player who qualified in a closed Season vote with none this Season", () => {
    const eligibility = buildVotingEligibility({
      threshold: 3,
      completedMatchCount: 12,
      currentSeason,
      participations: [played(ANA, SEASON_1, 3), played(BEA, SEASON_2, 1)],
    });

    expect(eligibility.armed).toBe(true);
    expect(eligibility.for(ANA)).toEqual({
      canVote: true,
      qualified: true,
      armed: true,
      threshold: 3,
      // Only the Current season gets out: the season worth pointing at is the
      // one the player can still earn it in, even when it is already banked.
      matchesThisSeason: 0,
      remaining: 3,
    });
  });
});

describe("buildVotingEligibility is total", () => {
  it("returns a valid record for an id in no participation row", () => {
    const eligibility = buildVotingEligibility({
      threshold: 2,
      completedMatchCount: 6,
      currentSeason,
      participations: [played(ANA, SEASON_2, 2)],
    });

    expect(eligibility.for("nobody-ever-heard-of")).toEqual({
      canVote: false,
      qualified: false,
      armed: true,
      threshold: 2,
      matchesThisSeason: 0,
      remaining: 2,
    });
  });

  it("returns a valid record from a Competition with no participation at all", () => {
    const eligibility = buildVotingEligibility({
      threshold: 2,
      completedMatchCount: 0,
      currentSeason: null,
      participations: [],
    });

    expect(eligibility.for(ANA)).toEqual({
      canVote: true,
      qualified: false,
      armed: false,
      threshold: 2,
      matchesThisSeason: 0,
      remaining: 2,
    });
  });
});

describe("buildVotingEligibility without a Current season", () => {
  it("reports no season number and counts nothing this Season", () => {
    const eligibility = buildVotingEligibility({
      threshold: 3,
      completedMatchCount: 12,
      currentSeason: null,
      participations: [played(ANA, SEASON_1, 3), played(BEA, SEASON_1, 1)],
    });

    expect(eligibility.currentSeasonNumber).toBeNull();
    expect(eligibility.armed).toBe(true);
    expect(eligibility.for(ANA)).toEqual({
      canVote: true,
      qualified: true,
      armed: true,
      threshold: 3,
      matchesThisSeason: 0,
      remaining: 3,
    });
    expect(eligibility.for(BEA).canVote).toBe(false);
  });

  it("reports the Current season's number when there is one", () => {
    const eligibility = buildVotingEligibility({
      threshold: null,
      completedMatchCount: 0,
      currentSeason,
      participations: [],
    });

    expect(eligibility.currentSeasonNumber).toBe(2);
  });
});

describe("buildVotingEligibility counts down what is remaining", () => {
  it("subtracts the Current season's matches from the threshold", () => {
    const eligibility = buildVotingEligibility({
      threshold: 5,
      completedMatchCount: 4,
      currentSeason,
      participations: [played(ANA, SEASON_2, 2)],
    });

    expect(eligibility.for(ANA).matchesThisSeason).toBe(2);
    expect(eligibility.for(ANA).remaining).toBe(3);
  });

  it("reaches zero exactly on the threshold", () => {
    const eligibility = buildVotingEligibility({
      threshold: 5,
      completedMatchCount: 5,
      currentSeason,
      participations: [played(ANA, SEASON_2, 5)],
    });

    expect(eligibility.for(ANA).remaining).toBe(0);
  });

  it("floors at zero for a player past the threshold", () => {
    const eligibility = buildVotingEligibility({
      threshold: 5,
      completedMatchCount: 12,
      currentSeason,
      participations: [played(ANA, SEASON_2, 9)],
    });

    expect(eligibility.for(ANA).matchesThisSeason).toBe(9);
    expect(eligibility.for(ANA).remaining).toBe(0);
  });

  it("ignores a past Season's matches in the count down", () => {
    const eligibility = buildVotingEligibility({
      threshold: 5,
      completedMatchCount: 12,
      currentSeason,
      participations: [played(ANA, SEASON_1, 4), played(ANA, SEASON_2, 1)],
    });

    expect(eligibility.for(ANA).matchesThisSeason).toBe(1);
    expect(eligibility.for(ANA).remaining).toBe(4);
  });
});
