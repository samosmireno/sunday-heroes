import { CompetitionType, MatchType, Team } from "@repo/shared-types";
import { describe, expect, it } from "vitest";
import {
  addPlayersToFixture,
  createDuel,
  createDuelMatch,
  createDuelWithClosedSeason,
  createLeague,
  createUser,
  createUserWithDashboard,
  defaultDuelPlayers,
  setFixtureDate,
  setFixtureScore,
} from "../../../test/factories";
import { SeasonRepo } from "../../repositories/season/season-repo";
import { createMatchRequest } from "../../schemas/create-match-request-schema";
import { AuthorizationError, ConflictError } from "../../utils/errors";
import { CompetitionService } from "../competition-service";
import { LeagueService } from "../league-service";
import { SeasonService } from "../season-service";
import { MatchService } from "./match-service";

describe("Duel Match creation", () => {
  it("a Duel and its Match read back through the competition and match services", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      name: "Thursday Duel",
    });

    const created = await createDuelMatch({
      competitionId: competition.id,
      homeTeamScore: 3,
      awayTeamScore: 1,
    });

    const stats = await CompetitionService.getCompetitionStats(
      competition.id,
      user.id,
    );
    expect(stats.type).toBe(CompetitionType.DUEL);
    expect(stats.matches).toHaveLength(1);
    expect(stats.matches[0]).toMatchObject({
      id: created.id,
      homeTeamScore: 3,
      awayTeamScore: 1,
    });

    const match = await MatchService.getMatchById(created.id);
    expect(match?.teams.sort()).toEqual(["Away", "Home"]);
    expect(match?.players.map((player) => player.nickname).sort()).toEqual([
      "Ana",
      "Bea",
      "Cal",
      "Dan",
    ]);
  });

  it("stamps a new Match with the Current season although the request carries none", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({ userId: user.id });

    const created = await createDuelMatch({ competitionId: competition.id });

    const current = await SeasonRepo.findCurrent(competition.id);
    expect(created.seasonId).toBe(current?.id);
    expect(await SeasonRepo.listWithCounts(competition.id)).toEqual([
      expect.objectContaining({ number: 1, matchCount: 1 }),
    ]);
  });

  it("stamps a Match created after a rollover with Season 2", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, currentSeason } = await createDuelWithClosedSeason({
      userId: user.id,
    });

    const created = await createDuelMatch({ competitionId: competition.id });

    expect(created.seasonId).toBe(currentSeason.id);
    expect(await SeasonRepo.listWithCounts(competition.id)).toEqual([
      expect.objectContaining({ number: 1, matchCount: 1 }),
      expect.objectContaining({ number: 2, matchCount: 1 }),
    ]);
  });
});

describe("MatchService.getMatchesForUser", () => {
  it("lists and counts the selected season's matches of a Competition, the Current season by default", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, seasonOneMatch } = await createDuelWithClosedSeason({
      userId: user.id,
    });

    const current = await MatchService.getMatchesForUser(user.id, {
      competitionId: competition.id,
    });
    expect(current).toMatchObject({
      matches: [],
      totalCount: 0,
      totalPages: 0,
    });

    const seasonOne = await MatchService.getMatchesForUser(user.id, {
      competitionId: competition.id,
      season: 1,
    });
    expect(seasonOne.matches.map((match) => match.id)).toEqual([
      seasonOneMatch.id,
    ]);
    expect(seasonOne).toMatchObject({ totalCount: 1, totalPages: 1 });

    const all = await MatchService.getMatchesForUser(user.id, {
      competitionId: competition.id,
      season: "all",
    });
    expect(all.totalCount).toBe(1);
  });

  it("tags each Match with its Season so the user-wide list can show a Past season's Match as closed", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, seasonOneMatch } = await createDuelWithClosedSeason({
      userId: user.id,
    });
    const seasonTwoMatch = await createDuelMatch({
      competitionId: competition.id,
      date: "2026-02-20",
    });

    const { matches } = await MatchService.getMatchesForUser(user.id, {
      competitionId: competition.id,
      season: "all",
    });

    expect(matches.map(({ id, season }) => ({ id, season }))).toEqual([
      { id: seasonTwoMatch.id, season: { number: 2, isClosed: false } },
      { id: seasonOneMatch.id, season: { number: 1, isClosed: true } },
    ]);
  });
});

describe("MatchService.getMatchById", () => {
  it("tags the Match with its Season, closed after a rollover", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, seasonOneMatch } = await createDuelWithClosedSeason({
      userId: user.id,
    });
    const seasonTwoMatch = await createDuelMatch({
      competitionId: competition.id,
    });

    expect(
      (await MatchService.getMatchById(seasonOneMatch.id))?.season,
    ).toEqual({ number: 1, isClosed: true });
    expect(
      (await MatchService.getMatchById(seasonTwoMatch.id))?.season,
    ).toEqual({ number: 2, isClosed: false });
  });
});

const PAST_SEASON_CONFLICT = new ConflictError(
  "Matches from a past season cannot be changed.",
);

/** The edit-match request: a new score for the Match between `teams`, the players as they were. */
function matchUpdate(
  competitionId: string,
  teams: [string, string],
  homeTeamScore: number,
  awayTeamScore: number,
): createMatchRequest {
  return {
    competitionId,
    date: "2026-01-10",
    homeTeamScore,
    awayTeamScore,
    matchType: MatchType.FIVE_A_SIDE,
    round: 1,
    teams,
    players: defaultDuelPlayers,
  };
}

describe("Past seasons are read-only: Match update (ADR 0002)", () => {
  it("refuses to update a completed Season-1 Fixture after the rollover, leaving its score and the Standings counters as they were, while a Season-2 Fixture updates", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, teams, fixtures } = await createLeague({
      userId: user.id,
      numberOfTeams: 2,
    });
    const [fixture] = fixtures;
    await addPlayersToFixture(fixture.match.id, defaultDuelPlayers);
    await setFixtureScore(fixture.match.id, 2, 0);
    await setFixtureDate(
      fixture.match.id,
      new Date("2026-02-01T18:00:00.000Z"),
    );
    await LeagueService.completeMatch(fixture.match.id, user.id);
    await SeasonService.startNewSeason(competition.id, user.id);

    await expect(
      MatchService.updateMatch(
        fixture.match.id,
        matchUpdate(
          competition.id,
          [fixture.homeTeam.name, fixture.awayTeam.name],
          0,
          3,
        ),
        user.id,
      ),
    ).rejects.toThrow(PAST_SEASON_CONFLICT);

    expect(await MatchService.getMatchById(fixture.match.id)).toMatchObject({
      homeTeamScore: 2,
      awayTeamScore: 0,
      isCompleted: true,
    });
    for (const row of await LeagueService.getLeagueStandings(competition.id)) {
      expect(row).toMatchObject({
        played: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      });
    }

    // Teams setup generates Season 2's Fixtures, and those can be edited.
    await LeagueService.updateTeamNames(
      competition.id,
      teams.map((team, index) => ({
        id: team.id,
        name: ["Lions", "Tigers"][index],
      })),
      user.id,
    );
    const [seasonTwoFixture] = await LeagueService.getLeagueFixtures(
      competition.id,
    );
    const sideName = (isHome: boolean) =>
      seasonTwoFixture.matchTeams.find((mt) => mt.isHome === isHome)!.team.name;
    await MatchService.updateMatch(
      seasonTwoFixture.id,
      matchUpdate(competition.id, [sideName(true), sideName(false)], 4, 4),
      user.id,
    );

    expect(await MatchService.getMatchById(seasonTwoFixture.id)).toMatchObject({
      homeTeamScore: 4,
      awayTeamScore: 4,
    });
  });
});

describe("Past seasons are read-only: Match delete (ADR 0002)", () => {
  it("refuses to delete a Season-1 Duel Match after the rollover and keeps it, while a Season-2 Match deletes", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, seasonOneMatch } = await createDuelWithClosedSeason({
      userId: user.id,
    });
    const seasonTwoMatch = await createDuelMatch({
      competitionId: competition.id,
    });

    await expect(
      MatchService.deleteMatch(seasonOneMatch.id, user.id),
    ).rejects.toThrow(PAST_SEASON_CONFLICT);
    expect(await MatchService.getMatchById(seasonOneMatch.id)).not.toBeNull();

    await MatchService.deleteMatch(seasonTwoMatch.id, user.id);
    expect(await MatchService.getMatchById(seasonTwoMatch.id)).toBeNull();
  });
});

describe("Past seasons are read-only: Duel Match update (ADR 0002)", () => {
  it("refuses to update a Season-1 Match after the rollover and keeps its score, while a Season-2 Match updates", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, seasonOneMatch } = await createDuelWithClosedSeason({
      userId: user.id,
    });
    const seasonTwoMatch = await createDuelMatch({
      competitionId: competition.id,
    });
    const newScore = matchUpdate(competition.id, [Team.HOME, Team.AWAY], 5, 5);

    await expect(
      MatchService.updateMatch(seasonOneMatch.id, newScore, user.id),
    ).rejects.toThrow(PAST_SEASON_CONFLICT);
    expect(await MatchService.getMatchById(seasonOneMatch.id)).toMatchObject({
      homeTeamScore: 2,
      awayTeamScore: 1,
    });

    await MatchService.updateMatch(seasonTwoMatch.id, newScore, user.id);
    expect(await MatchService.getMatchById(seasonTwoMatch.id)).toMatchObject({
      homeTeamScore: 5,
      awayTeamScore: 5,
    });
  });
});

describe("Permission precedes the read-only guard", () => {
  it("a player on a closed-season Match gets the authorization error, not the conflict, from update and delete", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, seasonOneMatch } = await createDuelWithClosedSeason({
      userId: user.id,
    });
    const player = await createUser();

    await expect(
      MatchService.updateMatch(
        seasonOneMatch.id,
        matchUpdate(competition.id, [Team.HOME, Team.AWAY], 5, 5),
        player.id,
      ),
    ).rejects.toBeInstanceOf(AuthorizationError);
    await expect(
      MatchService.deleteMatch(seasonOneMatch.id, player.id),
    ).rejects.toBeInstanceOf(AuthorizationError);

    expect(await MatchService.getMatchById(seasonOneMatch.id)).toMatchObject({
      homeTeamScore: 2,
      awayTeamScore: 1,
    });
  });
});
