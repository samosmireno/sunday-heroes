import { describe, expect, it } from "vitest";
import {
  addModerator,
  addPlayersToFixture,
  createDuel,
  createDuelMatch,
  createDuelWithClosedSeason,
  createLeague,
  createUser,
  createUserWithDashboard,
  setFixtureDate,
  setFixtureScore,
} from "../../test/factories";
import prisma from "../repositories/prisma-client";
import { SeasonRepo } from "../repositories/season/season-repo";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from "../utils/errors";
import { LeagueService } from "./league-service";
import { SeasonService } from "./season-service";

/** Plays and completes a Fixture through the League service so the Standings move. */
async function completeFixture(fixtureId: string, userId: string) {
  await addPlayersToFixture(fixtureId, [
    { nickname: "Ana", isHome: true, goals: 2 },
    { nickname: "Bo", isHome: false },
  ]);
  await setFixtureScore(fixtureId, 2, 0);
  await setFixtureDate(fixtureId, new Date("2026-02-01T18:00:00.000Z"));
  await LeagueService.completeMatch(fixtureId, userId);
}

describe("SeasonService.startNewSeason", () => {
  it("League: closes Season 1, opens Season 2 at the same instant and zeroes the Standings", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, fixtures } = await createLeague({
      userId: user.id,
      numberOfTeams: 4,
    });
    await completeFixture(fixtures[0].match.id, user.id);
    const before = await LeagueService.getLeagueStandings(competition.id);
    expect(before[0].points).toBe(3);

    const started = await SeasonService.startNewSeason(competition.id, user.id);

    expect(started).toMatchObject({ number: 2, endedAt: null });
    const seasons = await SeasonRepo.listWithCounts(competition.id);
    expect(seasons).toEqual([
      expect.objectContaining({
        number: 1,
        endedAt: started.startedAt,
        matchCount: 6,
        completedMatchCount: 1,
      }),
      expect.objectContaining({
        number: 2,
        startedAt: started.startedAt,
        endedAt: null,
        matchCount: 0,
      }),
    ]);

    const after = await LeagueService.getLeagueStandings(competition.id);
    expect(after).toHaveLength(4);
    for (const row of after) {
      expect(row).toMatchObject({
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        played: 0,
      });
    }
  });

  it("Duel: the same season step, with the standings rows untouched", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({ userId: user.id });
    await createDuelMatch({ competitionId: competition.id });
    // Leaf state: a Duel never moves its counters, so give them something to keep.
    await prisma.teamCompetition.updateMany({
      where: { competitionId: competition.id },
      data: { points: 4, wins: 1, draws: 1, goalsFor: 3, goalsAgainst: 2 },
    });

    const started = await SeasonService.startNewSeason(competition.id, user.id);

    expect(started).toMatchObject({ number: 2, endedAt: null });
    expect(await SeasonRepo.listWithCounts(competition.id)).toEqual([
      expect.objectContaining({
        number: 1,
        endedAt: started.startedAt,
        matchCount: 1,
      }),
      expect.objectContaining({ number: 2, endedAt: null, matchCount: 0 }),
    ]);
    const rows = await LeagueService.getLeagueStandings(competition.id);
    expect(rows.map((row) => row.points)).toEqual([4, 4]);
  });

  it("refuses an empty Current season and writes nothing", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({ userId: user.id });

    await expect(
      SeasonService.startNewSeason(competition.id, user.id),
    ).rejects.toThrow(new ConflictError("The current season has no matches."));

    expect(await SeasonRepo.listWithCounts(competition.id)).toEqual([
      expect.objectContaining({ number: 1, endedAt: null }),
    ]);
  });

  it("lets exactly one of two concurrent rollovers win", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({ userId: user.id });
    await createDuelMatch({ competitionId: competition.id });

    const outcomes = await Promise.allSettled([
      SeasonService.startNewSeason(competition.id, user.id),
      SeasonService.startNewSeason(competition.id, user.id),
    ]);

    const fulfilled = outcomes.filter((o) => o.status === "fulfilled");
    const rejected = outcomes.filter((o) => o.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason).toEqual(
      new ConflictError("The season has already been closed."),
    );

    const seasons = await SeasonRepo.listWithCounts(competition.id);
    expect(seasons.map((season) => season.number)).toEqual([1, 2]);
    expect(seasons.filter((season) => season.endedAt === null)).toHaveLength(1);
  });

  it("refuses a moderator and a player before looking at the season", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const { competition } = await createDuel({ userId: user.id });
    // No Match: an unauthorized user must still get the authorization error.
    const { user: moderator } = await addModerator({
      competitionId: competition.id,
      dashboardId: dashboard.id,
    });
    const player = await createUser();

    for (const outsider of [moderator, player]) {
      await expect(
        SeasonService.startNewSeason(competition.id, outsider.id),
      ).rejects.toBeInstanceOf(AuthorizationError);
    }

    expect(await SeasonRepo.listWithCounts(competition.id)).toEqual([
      expect.objectContaining({ number: 1, endedAt: null }),
    ]);
  });
});

describe("SeasonService.resolveSeasonFilter", () => {
  async function seasonId(competitionId: string, number: number) {
    const seasons = await SeasonRepo.listWithCounts(competitionId);
    return seasons.find((season) => season.number === number)!.id;
  }

  it("selects the Current season when the filter is absent", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuelWithClosedSeason({
      userId: user.id,
    });

    expect(
      await SeasonService.resolveSeasonFilter(competition.id, undefined),
    ).toEqual({ seasonId: await seasonId(competition.id, 2) });
  });

  it("selects one Season by number", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuelWithClosedSeason({
      userId: user.id,
    });

    expect(await SeasonService.resolveSeasonFilter(competition.id, 1)).toEqual({
      seasonId: await seasonId(competition.id, 1),
    });
  });

  it("selects every Season for All seasons", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuelWithClosedSeason({
      userId: user.id,
    });

    expect(
      await SeasonService.resolveSeasonFilter(competition.id, "all"),
    ).toEqual({});
  });

  it("does not find an unknown number, nor a number that exists only on another Competition", async () => {
    const { user } = await createUserWithDashboard();
    await createDuelWithClosedSeason({ userId: user.id, name: "Two seasons" });
    const { competition: other } = await createDuel({
      userId: user.id,
      name: "One season",
    });

    await expect(
      SeasonService.resolveSeasonFilter(other.id, 9),
    ).rejects.toThrow(new NotFoundError("Season"));
    await expect(
      SeasonService.resolveSeasonFilter(other.id, 2),
    ).rejects.toThrow(new NotFoundError("Season"));
  });

  it("does not find an unknown Competition", async () => {
    await expect(
      SeasonService.resolveSeasonFilter("no-such-competition", undefined),
    ).rejects.toThrow(new NotFoundError("Competition"));
  });
});
