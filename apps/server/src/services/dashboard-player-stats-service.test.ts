import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardPlayerRepo } from "../repositories/dashboard-player/dashboard-player-repo";
import { DashboardPlayerStatsRepo } from "../repositories/dashboard-player/dashboard-player-stats-repo";
import { DashboardPlayerStatsService } from "./dashboard-player-stats-service";

/** A player known to the dashboard, with no user account, so no related players. */
function lonePlayer(id: string) {
  return { id, nickname: "Ana", userId: null, user: null } as never;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DashboardPlayerStatsService.getPlayerStats", () => {
  it("rates the career record with a draw worth 0.3 of a win", async () => {
    vi.spyOn(DashboardPlayerRepo, "findByIdWithUserDetails").mockResolvedValue(
      lonePlayer("player-1"),
    );
    vi.spyOn(
      DashboardPlayerStatsRepo,
      "getPlayerCareerStats",
    ).mockResolvedValue({
      totalMatches: 4,
      totalGoals: 0,
      totalAssists: 0,
      avgRating: 0,
      totalCompetitions: 1,
      record: { wins: 1, draws: 2, losses: 1 },
      manOfTheMatchCount: 0,
      goalConsistencyRate: 0,
      assistConsistencyRate: 0,
    });
    vi.spyOn(DashboardPlayerStatsRepo, "getRecentForm").mockResolvedValue([]);

    const stats = await DashboardPlayerStatsService.getPlayerStats("player-1");

    // (1 win + 2 draws * 0.3) / 4 matches
    expect(stats.careerStats.winRate).toBe(40);
    expect(stats.careerStats.record).toEqual({ wins: 1, draws: 2, losses: 1 });
  });

  it("rates a career with no matches at zero", async () => {
    vi.spyOn(DashboardPlayerRepo, "findByIdWithUserDetails").mockResolvedValue(
      lonePlayer("player-1"),
    );
    vi.spyOn(
      DashboardPlayerStatsRepo,
      "getPlayerCareerStats",
    ).mockResolvedValue({
      totalMatches: 0,
      totalGoals: 0,
      totalAssists: 0,
      avgRating: 0,
      totalCompetitions: 0,
      record: { wins: 0, draws: 0, losses: 0 },
      manOfTheMatchCount: 0,
      goalConsistencyRate: 0,
      assistConsistencyRate: 0,
    });
    vi.spyOn(DashboardPlayerStatsRepo, "getRecentForm").mockResolvedValue([]);

    const stats = await DashboardPlayerStatsService.getPlayerStats("player-1");

    expect(stats.careerStats.winRate).toBe(0);
  });
});

describe("DashboardPlayerStatsService.getTopTeammates", () => {
  it("rates each teammate over the matches played together, draws at 0.3", async () => {
    vi.spyOn(DashboardPlayerRepo, "findById").mockResolvedValue(
      lonePlayer("player-1"),
    );
    vi.spyOn(DashboardPlayerStatsRepo, "getTopTeammates").mockResolvedValue([
      {
        dashboardPlayerId: "player-2",
        nickname: "Bo",
        isRegistered: false,
        matchesTogether: 2,
        record: { wins: 1, draws: 1, losses: 0 },
      },
      {
        dashboardPlayerId: "player-3",
        nickname: "Cy",
        isRegistered: true,
        matchesTogether: 3,
        record: { wins: 0, draws: 1, losses: 2 },
      },
    ]);

    const teammates =
      await DashboardPlayerStatsService.getTopTeammates("player-1");

    // (1 + 0.3) / 2 and 0.3 / 3
    expect(teammates.map((t) => [t.nickname, t.winRate])).toEqual([
      ["Bo", 65],
      ["Cy", 10],
    ]);
  });
});
