import { PlayerTotals, Role } from "@repo/shared-types";
import { describe, expect, it } from "vitest";
import {
  createDuel,
  createDuelMatch,
  createDuelWithClosedSeason,
  createLeague,
  createUserWithDashboard,
  markCompleted,
} from "../../test/factories";
import { SeasonRepo } from "../repositories/season/season-repo";
import { CompetitionService } from "./competition-service";

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
