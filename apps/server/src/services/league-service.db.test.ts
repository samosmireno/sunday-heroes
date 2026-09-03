import { MatchType } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  addModerator,
  addPlayersToFixture,
  createLeague,
  createLeagueWithClosedSeason,
  createUser,
  createUserWithDashboard,
  markCompleted,
  setFixtureScore,
} from "../../test/factories";
import { MatchRepo } from "../repositories/match/match-repo";
import { MatchWithDetails } from "../repositories/match/types";
import { SeasonRepo } from "../repositories/season/season-repo";
import { AuthorizationError } from "../utils/errors";
import { LeagueService } from "./league-service";
import { MatchService } from "./match/match-service";
import { SeasonService } from "./season-service";
import { transformLeagueFixtureToResponse } from "../utils/league-transforms";

async function countFixtures(competitionId: string) {
  const fixturesByRound = await LeagueService.getLeagueFixtures(competitionId);
  return Object.values(fixturesByRound).flat().length;
}

const TEAM_NAMES = ["Lions", "Tigers", "Bears", "Wolves", "Eagles"];

/** The team-names save an admin makes on Teams setup: every team under a real name. */
function nameTeams(teams: { id: string }[]) {
  return teams.map((team, index) => ({ id: team.id, name: TEAM_NAMES[index] }));
}

/**
 * The round-robin shape of a Season's Fixtures: rounds contiguous from 1
 * (n-1 for even n, n for odd, doubled for a double round-robin), each with
 * floor(n/2) matches, and every pair of teams meeting `meetings` times.
 * Order is never asserted: the generator shuffles teams and home/away.
 */
function expectRoundRobin(
  fixturesByRound: Record<number, MatchWithDetails[]>,
  teamIds: string[],
  meetings: 1 | 2,
) {
  const n = teamIds.length;
  const roundCount = (n % 2 === 0 ? n - 1 : n) * meetings;
  const rounds = Object.keys(fixturesByRound)
    .map(Number)
    .sort((a, b) => a - b);
  expect(rounds).toEqual(Array.from({ length: roundCount }, (_, i) => i + 1));
  for (const round of rounds) {
    expect(fixturesByRound[round]).toHaveLength(Math.floor(n / 2));
  }

  const meetingsByPair = new Map<string, number>();
  for (const match of Object.values(fixturesByRound).flat()) {
    const pair = match.matchTeams
      .map((matchTeam) => matchTeam.teamId)
      .sort()
      .join("|");
    meetingsByPair.set(pair, (meetingsByPair.get(pair) ?? 0) + 1);
  }
  const ids = [...teamIds].sort();
  const expectedMeetings = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      expectedMeetings.set(`${ids[i]}|${ids[j]}`, meetings);
    }
  }
  expect(meetingsByPair).toEqual(expectedMeetings);
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

describe("Season filter on the League reads", () => {
  it("getLeagueFixtures shows the selected season's Fixtures, the Current season by default", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createLeagueWithClosedSeason({
      userId: user.id,
      numberOfTeams: 4,
    });

    expect(await LeagueService.getLeagueFixtures(competition.id)).toEqual({});
    expect(
      Object.values(
        await LeagueService.getLeagueFixtures(competition.id, 1),
      ).flat(),
    ).toHaveLength(6);
    expect(
      Object.values(
        await LeagueService.getLeagueFixtures(competition.id, "all"),
      ).flat(),
    ).toHaveLength(6);
  });

  it("getPlayerStats counts the selected season's matches, the Current season by default", async () => {
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
    const competitionId = fixtures[0].match.competitionId;
    await SeasonService.startNewSeason(competitionId, user.id);

    expect(await LeagueService.getPlayerStats(competitionId)).toEqual([]);
    const seasonOne = await LeagueService.getPlayerStats(competitionId, 1);
    expect(seasonOne.map((player) => player.nickname).sort()).toEqual([
      "Ana",
      "Bo",
    ]);
  });

  it("the fixtures read tags every Fixture with its Season, closed once the Season is a Past season", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createLeagueWithClosedSeason({
      userId: user.id,
      numberOfTeams: 2,
    });

    const seasonOne = transformLeagueFixtureToResponse(
      await LeagueService.getLeagueFixtures(competition.id, 1),
    );

    expect(Object.values(seasonOne).flat()).toEqual([
      expect.objectContaining({ season: { number: 1, isClosed: true } }),
    ]);
  });
});

describe("Fixtures on Teams setup save", () => {
  it("after a rollover, saving the team names generates Season 2's Fixtures with Season 1's match type", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, teams, currentSeason } =
      await createLeagueWithClosedSeason({
        userId: user.id,
        numberOfTeams: 4,
        matchType: MatchType.SEVEN_A_SIDE,
      });

    const result = await LeagueService.updateTeamNames(
      competition.id,
      nameTeams(teams),
      user.id,
    );

    expect(result.fixturesGenerated).toBe(6);
    const fixturesByRound = await LeagueService.getLeagueFixtures(
      competition.id,
    );
    const fixtures = Object.values(fixturesByRound).flat();
    expect(fixtures.map((fixture) => fixture.seasonId)).toEqual(
      Array(6).fill(currentSeason.id),
    );
    expect(fixtures.map((fixture) => fixture.matchType)).toEqual(
      Array(6).fill(MatchType.SEVEN_A_SIDE),
    );
    expectRoundRobin(
      fixturesByRound,
      teams.map((team) => team.id),
      1,
    );
    expect(
      Object.values(
        await LeagueService.getLeagueFixtures(competition.id, 1),
      ).flat(),
    ).toHaveLength(6);
  });

  it("an odd number of teams gets n rounds, each with a bye", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, teams } = await createLeagueWithClosedSeason({
      userId: user.id,
      numberOfTeams: 5,
    });

    const result = await LeagueService.updateTeamNames(
      competition.id,
      nameTeams(teams),
      user.id,
    );

    expect(result.fixturesGenerated).toBe(10);
    expectRoundRobin(
      await LeagueService.getLeagueFixtures(competition.id),
      teams.map((team) => team.id),
      1,
    );
  });

  it("a double round-robin League gets n(n-1) Fixtures, every pair meeting twice", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, teams } = await createLeagueWithClosedSeason({
      userId: user.id,
      numberOfTeams: 4,
      isRoundRobin: true,
    });

    const result = await LeagueService.updateTeamNames(
      competition.id,
      nameTeams(teams),
      user.id,
    );

    expect(result.fixturesGenerated).toBe(12);
    expectRoundRobin(
      await LeagueService.getLeagueFixtures(competition.id),
      teams.map((team) => team.id),
      2,
    );
  });

  it("saving again generates nothing and leaves Season 2's Fixtures as they were", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, teams } = await createLeagueWithClosedSeason({
      userId: user.id,
      numberOfTeams: 4,
    });
    await LeagueService.updateTeamNames(
      competition.id,
      nameTeams(teams),
      user.id,
    );
    const fixtureIds = (
      await MatchRepo.findByCompetitionId(competition.id)
    ).map((match) => match.id);

    const again = await LeagueService.updateTeamNames(
      competition.id,
      nameTeams(teams),
      user.id,
    );

    expect(again.fixturesGenerated).toBe(0);
    expect(
      (await MatchRepo.findByCompetitionId(competition.id))
        .map((match) => match.id)
        .sort(),
    ).toEqual([...fixtureIds].sort());
  });

  it("saving while the Current season already has a Match generates nothing: Season 1 got its Fixtures at creation", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, teams } = await createLeague({
      userId: user.id,
      numberOfTeams: 4,
    });

    const result = await LeagueService.updateTeamNames(
      competition.id,
      nameTeams(teams),
      user.id,
    );

    expect(result.fixturesGenerated).toBe(0);
    expect(await countFixtures(competition.id)).toBe(6);
  });

  it("generates the Fixtures for the team set as it stands after a merge", async () => {
    const { user } = await createUserWithDashboard();
    // "Lions" already exists in the dashboard, in another League.
    const other = await createLeague({ userId: user.id, name: "Other" });
    await LeagueService.updateTeamNames(
      other.competition.id,
      nameTeams(other.teams),
      user.id,
    );
    const lions = other.teams[0];
    const { competition, teams } = await createLeagueWithClosedSeason({
      userId: user.id,
      numberOfTeams: 4,
    });

    const result = await LeagueService.updateTeamNames(
      competition.id,
      [
        { id: teams[0].id, name: "Lions" },
        ...teams.slice(1).map((team, index) => ({
          id: team.id,
          name: `Newcomers ${index + 1}`,
        })),
      ],
      user.id,
    );

    expect(result.fixturesGenerated).toBe(6);
    expectRoundRobin(
      await LeagueService.getLeagueFixtures(competition.id),
      [lions.id, ...teams.slice(1).map((team) => team.id)],
      1,
    );
  });

  it("a moderator may save and generate the Fixtures", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const { competition, teams } = await createLeagueWithClosedSeason({
      userId: user.id,
      numberOfTeams: 4,
    });
    const { user: moderator } = await addModerator({
      competitionId: competition.id,
      dashboardId: dashboard.id,
    });

    const result = await LeagueService.updateTeamNames(
      competition.id,
      nameTeams(teams),
      moderator.id,
    );

    expect(result.fixturesGenerated).toBe(6);
    expect(await countFixtures(competition.id)).toBe(6);
  });

  it("a player may not save, and nothing is generated", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, teams } = await createLeagueWithClosedSeason({
      userId: user.id,
      numberOfTeams: 4,
    });
    const player = await createUser();

    await expect(
      LeagueService.updateTeamNames(
        competition.id,
        nameTeams(teams),
        player.id,
      ),
    ).rejects.toThrow(AuthorizationError);

    expect(await countFixtures(competition.id)).toBe(0);
  });
});
