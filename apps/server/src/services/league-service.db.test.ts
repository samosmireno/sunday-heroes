import { describe, expect, it } from "vitest";
import {
  addPlayersToFixture,
  createLeague,
  createUserWithDashboard,
  markCompleted,
  setFixtureScore,
} from "../../test/factories";
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
