import { describe, expect, it } from "vitest";
import {
  addPlayersToFixture,
  createLeague,
  createUserWithDashboard,
  markCompleted,
  setFixtureScore,
} from "../../test/factories";
import { SeasonRepo } from "../repositories/season/season-repo";
import { LeagueService } from "./league-service";
import { MatchService } from "./match/match-service";

async function countFixtures(competitionId: string) {
  const fixturesByRound = await LeagueService.getLeagueFixtures(competitionId);
  return Object.values(fixturesByRound).flat().length;
}

describe("LeagueService.createLeague", () => {
  it("creates n(n-1)/2 Fixtures for a single round-robin of four teams", async () => {
    const { user } = await createUserWithDashboard();

    const { competition } = await createLeague({
      userId: user.id,
      numberOfTeams: 4,
    });

    expect(await countFixtures(competition.id)).toBe(6);
  });

  it("creates n(n-1)/2 Fixtures for an odd number of teams", async () => {
    const { user } = await createUserWithDashboard();

    const { competition } = await createLeague({
      userId: user.id,
      numberOfTeams: 5,
    });

    expect(await countFixtures(competition.id)).toBe(10);
  });

  it("creates n(n-1) Fixtures for a double round-robin", async () => {
    const { user } = await createUserWithDashboard();

    const { competition } = await createLeague({
      userId: user.id,
      numberOfTeams: 4,
      isRoundRobin: true,
    });

    expect(await countFixtures(competition.id)).toBe(12);
  });

  it("puts the League in an open Season 1 and stamps every initial Fixture with it", async () => {
    const { user } = await createUserWithDashboard();

    const { competition, fixtures } = await createLeague({
      userId: user.id,
      numberOfTeams: 4,
    });

    expect(await SeasonRepo.listWithCounts(competition.id)).toEqual([
      expect.objectContaining({
        number: 1,
        startedAt: competition.createdAt,
        endedAt: null,
        matchCount: 6,
        completedMatchCount: 0,
      }),
    ]);
    const current = await SeasonRepo.findCurrent(competition.id);
    expect(fixtures.map((fixture) => fixture.match.seasonId)).toEqual(
      Array(6).fill(current?.id),
    );
  });

  it("remembers the round-robin choice on the League", async () => {
    const { user } = await createUserWithDashboard();

    const single = await createLeague({ userId: user.id, isRoundRobin: false });
    const double = await createLeague({ userId: user.id, isRoundRobin: true });

    expect(single.competition.isRoundRobin).toBe(false);
    expect(double.competition.isRoundRobin).toBe(true);
  });
});

describe("Fixture leaf-state factories", () => {
  it("a Fixture given players, a score and completion reads back through the match service", async () => {
    const { user } = await createUserWithDashboard();
    const { fixtures } = await createLeague({
      userId: user.id,
      numberOfTeams: 2,
    });
    const fixtureId = fixtures[0].match.id;

    await addPlayersToFixture(fixtureId, [
      { nickname: "Ana", isHome: true, goals: 2 },
      { nickname: "Bo", isHome: false },
    ]);
    await setFixtureScore(fixtureId, 2, 0);
    await markCompleted(fixtureId);

    const match = await MatchService.getMatchById(fixtureId);

    expect(match).toMatchObject({
      homeTeamScore: 2,
      awayTeamScore: 0,
      isCompleted: true,
    });
    expect(match?.players.map((player) => player.nickname).sort()).toEqual([
      "Ana",
      "Bo",
    ]);
  });
});
