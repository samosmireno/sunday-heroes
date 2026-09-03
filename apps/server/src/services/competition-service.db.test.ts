import { MatchType } from "@prisma/client";
import { PlayerTotals, Role } from "@repo/shared-types";
import { describe, expect, it } from "vitest";
import {
  addModerator,
  addPlayersToFixture,
  createDuel,
  createDuelMatch,
  createDuelWithClosedSeason,
  createLeague,
  createRegisteredPlayer,
  createUser,
  createUserWithDashboard,
  markCompleted,
  setFixtureDate,
  setFixtureScore,
} from "../../test/factories";
import prisma from "../repositories/prisma-client";
import { MatchRepo } from "../repositories/match/match-repo";
import { SeasonRepo } from "../repositories/season/season-repo";
import { TeamRosterRepo } from "../repositories/team-roster-repo";
import { AuthorizationError } from "../utils/errors";
import { CompetitionService } from "./competition-service";
import { LeagueService } from "./league-service";
import { SeasonService } from "./season-service";
import { TeamService } from "./team-service";

describe("CompetitionService.createCompetition", () => {
  it("puts a new Duel in an open Season 1 that started when the Competition was created", async () => {
    const { user } = await createUserWithDashboard();

    const { competition } = await createDuel({ userId: user.id });

    expect(await SeasonRepo.listWithCounts(competition.id)).toEqual([
      expect.objectContaining({
        number: 1,
        startedAt: competition.createdAt,
        endedAt: null,
        matchCount: 0,
        completedMatchCount: 0,
      }),
    ]);
  });
});

describe("CompetitionService.getCompetitionSettings", () => {
  it("reports the Current season with its match, not-completed and open-voting counts", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, fixtures } = await createLeague({
      userId: user.id,
      numberOfTeams: 3,
    });
    await markCompleted(fixtures[0].match.id);

    const settings = await CompetitionService.getCompetitionSettings(
      competition.id,
      user.id,
    );

    expect(settings.currentSeason).toEqual({
      number: 1,
      startedAt: competition.createdAt.toISOString(),
      endedAt: null,
      matchCount: 3,
      completedMatchCount: 1,
      notCompletedCount: 2,
      openVotingCount: 0,
    });
    expect(settings.seasons).toEqual([
      expect.objectContaining({ number: 1, matchCount: 3 }),
    ]);
  });

  it("counts a Duel Match whose voting is open", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      votingEnabled: true,
    });
    await createDuelMatch({ competitionId: competition.id });

    const settings = await CompetitionService.getCompetitionSettings(
      competition.id,
      user.id,
    );

    expect(settings.currentSeason).toMatchObject({
      matchCount: 1,
      completedMatchCount: 1,
      notCompletedCount: 0,
      openVotingCount: 1,
    });
  });
});

describe("CompetitionService.getCompetitionInfo", () => {
  it("carries the user's role and the season list", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({ userId: user.id });

    const asAdmin = await CompetitionService.getCompetitionInfo(
      competition.id,
      user.id,
    );
    const anonymous = await CompetitionService.getCompetitionInfo(
      competition.id,
    );

    expect(asAdmin.userRole).toBe(Role.ADMIN);
    expect(anonymous.userRole).toBe(Role.PLAYER);
    expect(asAdmin.seasons).toEqual([
      {
        number: 1,
        startedAt: competition.createdAt.toISOString(),
        endedAt: null,
        matchCount: 0,
        completedMatchCount: 0,
      },
    ]);
  });
});

describe("CompetitionService.getCompetitionStats", () => {
  it("scopes matches and player stats to the Current season unless a season is selected", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, seasonOneMatch } = await createDuelWithClosedSeason({
      userId: user.id,
    });

    const current = await CompetitionService.getCompetitionStats(
      competition.id,
      user.id,
    );
    expect(current.matches).toEqual([]);
    expect(current.playerStats).toEqual([]);

    const seasonOne = await CompetitionService.getCompetitionStats(
      competition.id,
      user.id,
      1,
    );
    expect(seasonOne.matches.map((match) => match.id)).toEqual([
      seasonOneMatch.id,
    ]);
    expect(seasonOne.playerStats).toHaveLength(4);

    const all = await CompetitionService.getCompetitionStats(
      competition.id,
      user.id,
      "all",
    );
    expect(all.matches).toHaveLength(1);
  });

  it("tags each Match with its Season and totals each Season's players on its own after a rollover", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, seasonOneMatch } = await createDuelWithClosedSeason({
      userId: user.id,
    });
    const seasonTwoMatch = await createDuelMatch({
      competitionId: competition.id,
      date: "2026-02-20",
      homeTeamScore: 3,
      awayTeamScore: 0,
      players: [
        { nickname: "Ana", goals: 3, assists: 0, position: 1, isHome: true },
        { nickname: "Eva", goals: 0, assists: 0, position: 1, isHome: false },
      ],
    });
    const totals = (stats: { playerStats: PlayerTotals[] }) =>
      stats.playerStats
        .map(({ nickname, matches, goals }) => ({ nickname, matches, goals }))
        .sort((a, b) => a.nickname.localeCompare(b.nickname));

    const seasonOne = await CompetitionService.getCompetitionStats(
      competition.id,
      user.id,
      1,
    );
    expect(seasonOne.matches).toEqual([
      expect.objectContaining({
        id: seasonOneMatch.id,
        season: { number: 1, isClosed: true },
      }),
    ]);
    expect(totals(seasonOne)).toEqual([
      { nickname: "Ana", matches: 1, goals: 1 },
      { nickname: "Bea", matches: 1, goals: 1 },
      { nickname: "Cal", matches: 1, goals: 1 },
      { nickname: "Dan", matches: 1, goals: 0 },
    ]);

    const current = await CompetitionService.getCompetitionStats(
      competition.id,
      user.id,
    );
    expect(current.matches).toEqual([
      expect.objectContaining({
        id: seasonTwoMatch.id,
        season: { number: 2, isClosed: false },
      }),
    ]);
    expect(totals(current)).toEqual([
      { nickname: "Ana", matches: 1, goals: 3 },
      { nickname: "Eva", matches: 1, goals: 0 },
    ]);

    const all = await CompetitionService.getCompetitionStats(
      competition.id,
      user.id,
      "all",
    );
    expect(all.matches.map((match) => match.season)).toEqual([
      { number: 2, isClosed: false },
      { number: 1, isClosed: true },
    ]);
    expect(totals(all)).toContainEqual({
      nickname: "Ana",
      matches: 2,
      goals: 4,
    });
  });
});

const TEAM_NAMES = ["Lions", "Tigers", "Bears", "Wolves"];

describe("CompetitionService.resetCompetition", () => {
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

  /**
   * A League two seasons in: Season 1's Fixtures with one Completed match,
   * Season 2's Fixtures from Teams setup, named teams, and a registered
   * player on a roster (an account-less roster player with no Match would be
   * pruned by the unused-player cleanup, as today).
   */
  async function createLeagueTwoSeasonsIn() {
    const { user, dashboard } = await createUserWithDashboard();
    const { competition, teams, fixtures } = await createLeague({
      userId: user.id,
      numberOfTeams: 4,
      matchType: MatchType.SEVEN_A_SIDE,
    });
    await completeFixture(fixtures[0].match.id, user.id);
    await createRegisteredPlayer({
      dashboardId: dashboard.id,
      nickname: "Rosa",
    });
    await TeamService.addPlayerToTeam(
      teams[0].id,
      "Rosa",
      competition.id,
      user.id,
    );
    await SeasonService.startNewSeason(competition.id, user.id);
    await LeagueService.updateTeamNames(
      competition.id,
      teams.map((team, index) => ({ id: team.id, name: TEAM_NAMES[index] })),
      user.id,
    );
    expect(await MatchRepo.countByCompetitionId(competition.id)).toBe(12);

    return { user, competition, teams };
  }

  it("League: leaves zero Matches and an open Season 1 at the reset instant, keeping the teams, the zeroed Standings and the rosters", async () => {
    const { user, competition, teams } = await createLeagueTwoSeasonsIn();

    const before = new Date();
    await CompetitionService.resetCompetition(competition.id, user.id);
    const after = new Date();

    expect(await MatchRepo.countByCompetitionId(competition.id)).toBe(0);
    const seasons = await SeasonRepo.listWithCounts(competition.id);
    expect(seasons).toEqual([
      expect.objectContaining({
        number: 1,
        endedAt: null,
        matchCount: 0,
        completedMatchCount: 0,
      }),
    ]);
    expect(seasons[0].startedAt.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
    expect(seasons[0].startedAt.getTime()).toBeLessThanOrEqual(after.getTime());

    const standings = await LeagueService.getLeagueStandings(competition.id);
    expect(standings.map((row) => row.name).sort()).toEqual(
      [...TEAM_NAMES].sort(),
    );
    for (const row of standings) {
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
    const roster = await TeamRosterRepo.getTeamRoster(
      teams[0].id,
      competition.id,
    );
    expect(roster.map((entry) => entry.dashboardPlayer.nickname)).toEqual([
      "Rosa",
    ]);
  });

  it("Duel: is unchanged apart from the seasons: two seasons of Matches gone, the fixed teams and their rows kept", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, home, away } = await createDuelWithClosedSeason({
      userId: user.id,
    });
    await createDuelMatch({
      competitionId: competition.id,
      date: "2026-02-20",
    });
    // Leaf state: a Duel never moves its counters, so give them something to keep.
    await prisma.teamCompetition.updateMany({
      where: { competitionId: competition.id },
      data: { points: 4, wins: 1, draws: 1, goalsFor: 3, goalsAgainst: 2 },
    });

    await CompetitionService.resetCompetition(competition.id, user.id);

    expect(await MatchRepo.countByCompetitionId(competition.id)).toBe(0);
    expect(await SeasonRepo.listWithCounts(competition.id)).toEqual([
      expect.objectContaining({ number: 1, endedAt: null, matchCount: 0 }),
    ]);
    const { teams } = await CompetitionService.getCompetitionTeams(
      competition.id,
    );
    expect(teams.map((team) => team.id).sort()).toEqual(
      [home.id, away.id].sort(),
    );
    const rows = await LeagueService.getLeagueStandings(competition.id);
    expect(rows.map((row) => row.points)).toEqual([4, 4]);
  });
});

describe("Teams setup after a Reset competition", () => {
  it("regenerates Season 1's Fixtures with the match type the League was created with", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, teams } = await createLeague({
      userId: user.id,
      numberOfTeams: 4,
      matchType: MatchType.SEVEN_A_SIDE,
    });
    await CompetitionService.resetCompetition(competition.id, user.id);
    const seasonOne = await SeasonRepo.findCurrent(competition.id);

    const result = await LeagueService.updateTeamNames(
      competition.id,
      teams.map((team, index) => ({ id: team.id, name: TEAM_NAMES[index] })),
      user.id,
    );

    expect(result.fixturesGenerated).toBe(6);
    const fixtures = await MatchRepo.findByCompetitionId(competition.id);
    expect(fixtures).toHaveLength(6);
    expect(fixtures.map((fixture) => fixture.seasonId)).toEqual(
      Array(6).fill(seasonOne?.id),
    );
    expect(fixtures.map((fixture) => fixture.matchType)).toEqual(
      Array(6).fill(MatchType.SEVEN_A_SIDE),
    );
  });

  it("a League created before its match type was stored keeps it: Reset reads it off the Matches it deletes", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, teams } = await createLeague({
      userId: user.id,
      numberOfTeams: 4,
      matchType: MatchType.SEVEN_A_SIDE,
    });
    // Leaf state: a League from before the column, whose Fixtures alone know the type.
    await prisma.competition.update({
      where: { id: competition.id },
      data: { matchType: null },
    });

    await CompetitionService.resetCompetition(competition.id, user.id);
    const result = await LeagueService.updateTeamNames(
      competition.id,
      teams.map((team, index) => ({ id: team.id, name: TEAM_NAMES[index] })),
      user.id,
    );

    expect(result.fixturesGenerated).toBe(6);
    expect(
      (await MatchRepo.findByCompetitionId(competition.id)).map(
        (fixture) => fixture.matchType,
      ),
    ).toEqual(Array(6).fill(MatchType.SEVEN_A_SIDE));
  });
});

describe("CompetitionService.resetCompetition: permission", () => {
  it("refuses a moderator and a player, deleting nothing", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const { competition } = await createDuelWithClosedSeason({
      userId: user.id,
    });
    const { user: moderator } = await addModerator({
      competitionId: competition.id,
      dashboardId: dashboard.id,
    });
    const player = await createUser();

    for (const outsider of [moderator, player]) {
      await expect(
        CompetitionService.resetCompetition(competition.id, outsider.id),
      ).rejects.toBeInstanceOf(AuthorizationError);
    }

    expect(await MatchRepo.countByCompetitionId(competition.id)).toBe(1);
    expect(
      (await SeasonRepo.listWithCounts(competition.id)).map((s) => s.number),
    ).toEqual([1, 2]);
  });
});
