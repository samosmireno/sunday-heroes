import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  createDuel,
  createDuelMatch,
  createUserWithDashboard,
  findPlayerId,
} from "../../test/factories";
import { createMatchRequest } from "../schemas/create-match-request-schema";
import { SeasonService } from "./season-service";
import { VotingEligibilityService } from "./voting-eligibility-service";

/** A Duel match between one home player and one away player. */
function pair(home: string, away: string): createMatchRequest["players"] {
  return [
    { nickname: home, goals: 0, assists: 0, position: 1, isHome: true },
    { nickname: away, goals: 0, assists: 0, position: 1, isHome: false },
  ];
}

describe("VotingEligibilityService.load", () => {
  it("loads a Competition with no threshold as no gate", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const { competition } = await createDuel({ userId: user.id });
    await createDuelMatch({ competitionId: competition.id });

    const eligibility = await VotingEligibilityService.load(competition.id);

    expect(eligibility.armed).toBe(false);
    expect(eligibility.currentSeasonNumber).toBe(1);
    expect(eligibility.for(await findPlayerId(dashboard.id, "Ana"))).toEqual({
      canVote: true,
      qualified: false,
      armed: false,
      threshold: null,
      matchesThisSeason: 1,
      remaining: 0,
    });
  });

  it("arms once the Competition holds twice its threshold and someone qualified", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      votingThreshold: 2,
    });
    for (const players of [
      pair("Ana", "Cal"),
      pair("Ana", "Cal"),
      pair("Ana", "Cal"),
      pair("Ana", "Bea"),
    ]) {
      await createDuelMatch({ competitionId: competition.id, players });
    }

    const eligibility = await VotingEligibilityService.load(competition.id);
    const [ana, bea] = await Promise.all([
      findPlayerId(dashboard.id, "Ana"),
      findPlayerId(dashboard.id, "Bea"),
    ]);

    expect(eligibility.armed).toBe(true);
    expect(eligibility.for(ana)).toEqual({
      canVote: true,
      qualified: true,
      armed: true,
      threshold: 2,
      matchesThisSeason: 4,
      remaining: 0,
    });
    expect(eligibility.for(bea)).toEqual({
      canVote: false,
      qualified: false,
      armed: true,
      threshold: 2,
      matchesThisSeason: 1,
      remaining: 1,
    });
  });

  it("keeps qualification across a rollover and counts only the Current season", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      votingThreshold: 2,
    });
    for (let i = 0; i < 3; i++) {
      await createDuelMatch({
        competitionId: competition.id,
        players: pair("Ana", "Cal"),
      });
    }
    await SeasonService.startNewSeason(competition.id, user.id);
    await createDuelMatch({
      competitionId: competition.id,
      players: pair("Bea", "Dan"),
    });

    const eligibility = await VotingEligibilityService.load(competition.id);
    const [ana, bea] = await Promise.all([
      findPlayerId(dashboard.id, "Ana"),
      findPlayerId(dashboard.id, "Bea"),
    ]);

    expect(eligibility.currentSeasonNumber).toBe(2);
    expect(eligibility.armed).toBe(true);
    // Ana earned it in Season 1 and keeps it, with nothing this Season.
    expect(eligibility.for(ana)).toEqual({
      canVote: true,
      qualified: true,
      armed: true,
      threshold: 2,
      matchesThisSeason: 0,
      remaining: 2,
    });
    expect(eligibility.for(bea)).toEqual({
      canVote: false,
      qualified: false,
      armed: true,
      threshold: 2,
      matchesThisSeason: 1,
      remaining: 1,
    });
  });

  it("returns a no-gate answer for an id belonging to no Competition", async () => {
    const eligibility = await VotingEligibilityService.load(randomUUID());

    expect(eligibility.armed).toBe(false);
    expect(eligibility.currentSeasonNumber).toBeNull();
    expect(eligibility.for("anyone-at-all").canVote).toBe(true);
  });
});

describe("VotingEligibilityService.loadMany", () => {
  it("answers for every id given, each Competition on its own threshold", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const [gated, ungated] = await Promise.all([
      createDuel({ userId: user.id, name: "Gated", votingThreshold: 1 }),
      createDuel({ userId: user.id, name: "Ungated" }),
    ]);
    await createDuelMatch({
      competitionId: gated.competition.id,
      players: pair("Ana", "Cal"),
    });
    await createDuelMatch({
      competitionId: gated.competition.id,
      players: pair("Ana", "Cal"),
    });
    await createDuelMatch({ competitionId: ungated.competition.id });
    const unknownId = randomUUID();

    const eligibilities = await VotingEligibilityService.loadMany([
      gated.competition.id,
      ungated.competition.id,
      unknownId,
    ]);
    const bea = await findPlayerId(dashboard.id, "Bea");

    expect([...eligibilities.keys()]).toEqual([
      gated.competition.id,
      ungated.competition.id,
      unknownId,
    ]);
    // Threshold 1 and two Completed matches: armed, and Bea never played here.
    expect(eligibilities.get(gated.competition.id)!.armed).toBe(true);
    expect(eligibilities.get(gated.competition.id)!.for(bea).canVote).toBe(
      false,
    );
    // Bea played the ungated Competition, where nobody is ever blocked.
    expect(eligibilities.get(ungated.competition.id)!.armed).toBe(false);
    expect(eligibilities.get(ungated.competition.id)!.for(bea).canVote).toBe(
      true,
    );
    expect(eligibilities.get(unknownId)!.for(bea).threshold).toBeNull();
  });

  it("returns an empty map for an empty list", async () => {
    expect(await VotingEligibilityService.loadMany([])).toEqual(new Map());
  });
});
