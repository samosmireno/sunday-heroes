import { MatchType } from "@prisma/client";
import { LeagueTeamResponse } from "@repo/shared-types";
import { describe, expect, it } from "vitest";
import {
  addModerator,
  addPlayersToFixture,
  createLeague,
  createLeagueWithClosedSeason,
  createUser,
  createUserWithDashboard,
  markCompleted,
  setFixtureDate,
  setFixtureScore,
} from "../../test/factories";
import { MatchRepo } from "../repositories/match/match-repo";
import { MatchWithDetails } from "../repositories/match/types";
import { SeasonRepo } from "../repositories/season/season-repo";
import { AuthorizationError, NotFoundError } from "../utils/errors";
import { LeagueService } from "./league-service";
import { MatchService } from "./match/match-service";
import { SeasonService } from "./season-service";
import { transformLeagueFixturesToResponse } from "../utils/league-transforms";

async function countFixtures(competitionId: string) {
  return (await LeagueService.getLeagueFixtures(competitionId)).length;
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
/** Every generated Fixture carries the Current season and the copied match type. */
function expectStampedWith(
  fixtures: MatchWithDetails[],
  seasonId: string,
  matchType: MatchType,
) {
  expect(fixtures.length).toBeGreaterThan(0);
  expect(fixtures.map((fixture) => fixture.seasonId)).toEqual(
    Array(fixtures.length).fill(seasonId),
  );
  expect(fixtures.map((fixture) => fixture.matchType)).toEqual(
    Array(fixtures.length).fill(matchType),
  );
}

function expectRoundRobin(
  fixtures: MatchWithDetails[],
  teamIds: string[],
  meetings: 1 | 2,
) {
  const n = teamIds.length;
  const roundCount = (n % 2 === 0 ? n - 1 : n) * meetings;
  const rounds = [...new Set(fixtures.map((fixture) => fixture.round))].sort(
    (a, b) => a - b,
  );
  expect(rounds).toEqual(Array.from({ length: roundCount }, (_, i) => i + 1));
  for (const round of rounds) {
    expect(fixtures.filter((fixture) => fixture.round === round)).toHaveLength(
      Math.floor(n / 2),
    );
  }

  const meetingsByPair = new Map<string, number>();
  for (const match of fixtures) {
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

    expect(await LeagueService.getLeagueFixtures(competition.id)).toEqual([]);
    expect(
      await LeagueService.getLeagueFixtures(competition.id, 1),
    ).toHaveLength(6);
    expect(
      await LeagueService.getLeagueFixtures(competition.id, "all"),
    ).toHaveLength(6);
  });

  it("getLeagueFixtures lists every Fixture by season number descending, round ascending, date ascending", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, teams, fixtures } = await createLeagueWithClosedSeason(
      { userId: user.id, numberOfTeams: 4 },
    );
    await LeagueService.updateTeamNames(
      competition.id,
      nameTeams(teams),
      user.id,
    );
    // Season 1, round 1: the later date on the Fixture created first.
    const [firstOfRoundOne, secondOfRoundOne] = fixtures.filter(
      (fixture) => fixture.round === 1,
    );
    await setFixtureDate(
      firstOfRoundOne.match.id,
      new Date("2025-01-12T18:00:00.000Z"),
    );
    await setFixtureDate(
      secondOfRoundOne.match.id,
      new Date("2025-01-05T18:00:00.000Z"),
    );
    // Season 1, round 2: one dated Fixture, one undated.
    const [, secondOfRoundTwo] = fixtures.filter(
      (fixture) => fixture.round === 2,
    );
    await setFixtureDate(
      secondOfRoundTwo.match.id,
      new Date("2025-01-19T18:00:00.000Z"),
    );

    const all = await LeagueService.getLeagueFixtures(competition.id, "all");

    expect(
      all.map((fixture) => [
        fixture.season.number,
        fixture.round,
        fixture.date?.toISOString() ?? null,
      ]),
    ).toEqual([
      [2, 1, null],
      [2, 1, null],
      [2, 2, null],
      [2, 2, null],
      [2, 3, null],
      [2, 3, null],
      [1, 1, "2025-01-05T18:00:00.000Z"],
      [1, 1, "2025-01-12T18:00:00.000Z"],
      [1, 2, "2025-01-19T18:00:00.000Z"],
      [1, 2, null],
      [1, 3, null],
      [1, 3, null],
    ]);
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

    const seasonOne = transformLeagueFixturesToResponse(
      await LeagueService.getLeagueFixtures(competition.id, 1),
    );

    expect(seasonOne).toEqual([
      expect.objectContaining({ season: { number: 1, isClosed: true } }),
    ]);
  });

  it("the fixtures response is the declared League match shape: teams with their scores, round, state and Season", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, fixtures } = await createLeague({
      userId: user.id,
      numberOfTeams: 2,
    });
    const [fixture] = fixtures;
    await setFixtureScore(fixture.match.id, 2, 0);

    const response = transformLeagueFixturesToResponse(
      await LeagueService.getLeagueFixtures(competition.id),
    );

    expect(response).toEqual([
      {
        id: fixture.match.id,
        homeTeam: {
          id: fixture.homeTeam.id,
          name: fixture.homeTeam.name,
          score: 2,
        },
        awayTeam: {
          id: fixture.awayTeam.id,
          name: fixture.awayTeam.name,
          score: 0,
        },
        homeScore: 2,
        awayScore: 0,
        date: null,
        round: 1,
        votingStatus: "CLOSED",
        isCompleted: false,
        videoUrl: undefined,
        season: { number: 1, isClosed: false },
      },
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
    const fixtures = await LeagueService.getLeagueFixtures(competition.id);
    expectStampedWith(fixtures, currentSeason.id, MatchType.SEVEN_A_SIDE);
    expectRoundRobin(
      fixtures,
      teams.map((team) => team.id),
      1,
    );
    expect(
      await LeagueService.getLeagueFixtures(competition.id, 1),
    ).toHaveLength(6);
  });

  it("an odd number of teams gets n rounds, each with a bye", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, teams, currentSeason } =
      await createLeagueWithClosedSeason({
        userId: user.id,
        numberOfTeams: 5,
      });

    const result = await LeagueService.updateTeamNames(
      competition.id,
      nameTeams(teams),
      user.id,
    );

    expect(result.fixturesGenerated).toBe(10);
    const fixtures = await LeagueService.getLeagueFixtures(competition.id);
    expectRoundRobin(
      fixtures,
      teams.map((team) => team.id),
      1,
    );
    expectStampedWith(fixtures, currentSeason.id, MatchType.FIVE_A_SIDE);
  });

  it("a double round-robin League gets n(n-1) Fixtures, every pair meeting twice", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, teams, currentSeason } =
      await createLeagueWithClosedSeason({
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
    const fixtures = await LeagueService.getLeagueFixtures(competition.id);
    expectRoundRobin(
      fixtures,
      teams.map((team) => team.id),
      2,
    );
    expectStampedWith(fixtures, currentSeason.id, MatchType.FIVE_A_SIDE);
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

/** Plays and completes a Fixture through the League service so the Standings counters move. */
async function completeFixture(
  fixtureId: string,
  userId: string,
  homeTeamScore: number,
  awayTeamScore: number,
) {
  await addPlayersToFixture(fixtureId, [
    { nickname: "Ana", isHome: true, goals: homeTeamScore },
    { nickname: "Bo", isHome: false, goals: awayTeamScore },
  ]);
  await setFixtureScore(fixtureId, homeTeamScore, awayTeamScore);
  await setFixtureDate(fixtureId, new Date("2026-02-01T18:00:00.000Z"));
  await LeagueService.completeMatch(fixtureId, userId);
}

type StandingsFigures = Omit<LeagueTeamResponse, "id" | "name" | "team">;

const AT_ZERO: StandingsFigures = {
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  points: 0,
  goalDifference: 0,
};

const total = (rows: LeagueTeamResponse[], field: "points" | "played") =>
  rows.reduce((sum, row) => sum + row[field], 0);

describe("LeagueService.getLeagueStandings by season", () => {
  it("after a rollover: the zeroed counters by default, Season 1's table derived for 1, the All seasons table for all", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, teams, fixtures } = await createLeague({
      userId: user.id,
      numberOfTeams: 4,
    });
    await LeagueService.updateTeamNames(
      competition.id,
      nameTeams(teams),
      user.id,
    );
    const nameOf = new Map(nameTeams(teams).map(({ id, name }) => [id, name]));
    const idOf = (name: string) => teams[TEAM_NAMES.indexOf(name)].id;
    const row = (
      team: { id: string },
      figures: StandingsFigures,
    ): LeagueTeamResponse => {
      const name = nameOf.get(team.id) ?? "";
      return { id: team.id, name, ...figures, team: { id: team.id, name } };
    };
    // Round 1 of a four-team round-robin: two Fixtures between disjoint pairs.
    const [first, second] = fixtures.filter((fixture) => fixture.round === 1);
    const third = fixtures.find((fixture) => fixture.round === 2)!;
    await completeFixture(first.match.id, user.id, 2, 0);
    await completeFixture(second.match.id, user.id, 1, 0);
    // A score entered on a Fixture that is never completed.
    await setFixtureScore(third.match.id, 3, 3);
    const onSeasonOnesLastDay = await LeagueService.getLeagueStandings(
      competition.id,
    );

    await SeasonService.startNewSeason(competition.id, user.id);

    expect(await LeagueService.getLeagueStandings(competition.id)).toEqual(
      ["Bears", "Lions", "Tigers", "Wolves"].map((name) =>
        row({ id: idOf(name) }, AT_ZERO),
      ),
    );
    const seasonOne = await LeagueService.getLeagueStandings(competition.id, 1);
    expect(seasonOne).toEqual([
      row(first.homeTeam, {
        played: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 2,
        goalsAgainst: 0,
        points: 3,
        goalDifference: 2,
      }),
      row(second.homeTeam, {
        played: 1,
        wins: 1,
        draws: 0,
        losses: 0,
        goalsFor: 1,
        goalsAgainst: 0,
        points: 3,
        goalDifference: 1,
      }),
      row(second.awayTeam, {
        played: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 1,
        points: 0,
        goalDifference: -1,
      }),
      row(first.awayTeam, {
        played: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 2,
        points: 0,
        goalDifference: -2,
      }),
    ]);
    // The derived table is the one the counters showed on the Season's last day.
    expect(seasonOne).toEqual(onSeasonOnesLastDay);
    expect(
      await LeagueService.getLeagueStandings(competition.id, "all"),
    ).toEqual(seasonOne);
  });

  it("All seasons counts the Completed matches of every Season, and a team renamed since shows its current name", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, teams, fixtures } = await createLeague({
      userId: user.id,
      numberOfTeams: 4,
    });
    await LeagueService.updateTeamNames(
      competition.id,
      nameTeams(teams),
      user.id,
    );
    await completeFixture(fixtures[0].match.id, user.id, 2, 0);
    const seasonTwo = await SeasonService.startNewSeason(
      competition.id,
      user.id,
    );
    // Teams setup for Season 2 renames Lions and generates Season 2's Fixtures.
    await LeagueService.updateTeamNames(
      competition.id,
      [{ id: teams[0].id, name: "Lions FC" }, ...nameTeams(teams).slice(1)],
      user.id,
    );
    const seasonTwoFixture = (
      await MatchRepo.findByCompetitionId(competition.id, {
        where: { seasonId: seasonTwo.id },
      })
    )[0];
    await completeFixture(seasonTwoFixture.id, user.id, 1, 0);

    const seasonOne = await LeagueService.getLeagueStandings(competition.id, 1);
    const current = await LeagueService.getLeagueStandings(competition.id);
    const all = await LeagueService.getLeagueStandings(competition.id, "all");

    expect(seasonOne.map((row) => row.name).sort()).toEqual([
      "Bears",
      "Lions FC",
      "Tigers",
      "Wolves",
    ]);
    expect([total(seasonOne, "points"), total(seasonOne, "played")]).toEqual([
      3, 2,
    ]);
    expect([total(current, "points"), total(current, "played")]).toEqual([
      3, 2,
    ]);
    // Season 2's five other Fixtures are not completed and count for nothing.
    expect([total(all, "points"), total(all, "played")]).toEqual([6, 4]);
    // The Current season named by number is still the counters.
    expect(await LeagueService.getLeagueStandings(competition.id, 2)).toEqual(
      current,
    );
  });

  it("refuses a Season the Competition does not have", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createLeague({ userId: user.id });

    await expect(
      LeagueService.getLeagueStandings(competition.id, 9),
    ).rejects.toThrow(new NotFoundError("Season"));
  });

  it("refuses an unknown Competition like every other filtered read", async () => {
    await expect(
      LeagueService.getLeagueStandings("no-such-competition"),
    ).rejects.toThrow(new NotFoundError("Competition"));
  });
});
