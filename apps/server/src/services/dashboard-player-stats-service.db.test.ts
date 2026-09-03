import { describe, expect, it } from "vitest";
import {
  createDuel,
  createDuelMatch,
  createUserWithDashboard,
} from "../../test/factories";
import prisma from "../repositories/prisma-client";
import { DashboardPlayerStatsService } from "./dashboard-player-stats-service";

async function playerId(nickname: string) {
  const player = await prisma.dashboardPlayer.findFirstOrThrow({
    where: { nickname },
  });
  return player.id;
}

/** A Duel in which Ana and Bea share the Home side for a win, a draw and a loss. */
async function duelWithWinDrawLoss() {
  const { user } = await createUserWithDashboard();
  const { competition } = await createDuel({ userId: user.id });
  const results: [number, number, string][] = [
    [2, 0, "2026-01-10"],
    [1, 1, "2026-01-17"],
    [0, 3, "2026-01-24"],
  ];
  for (const [homeTeamScore, awayTeamScore, date] of results) {
    await createDuelMatch({
      competitionId: competition.id,
      homeTeamScore,
      awayTeamScore,
      date,
    });
  }
}

describe("DashboardPlayerStatsService.getPlayerStats", () => {
  it("rates the career record with a draw worth 0.3 of a win", async () => {
    await duelWithWinDrawLoss();

    const stats = await DashboardPlayerStatsService.getPlayerStats(
      await playerId("Ana"),
    );

    expect(stats.careerStats).toEqual(
      expect.objectContaining({
        totalMatches: 3,
        record: { wins: 1, draws: 1, losses: 1 },
        // (1 win + 1 draw * 0.3) / 3 matches
        winRate: 43.33,
      }),
    );
  });
});

describe("DashboardPlayerStatsService.getTopTeammates", () => {
  it("rates a teammate over the matches played together, with a draw worth 0.3", async () => {
    await duelWithWinDrawLoss();

    const teammates = await DashboardPlayerStatsService.getTopTeammates(
      await playerId("Ana"),
    );

    expect(teammates).toEqual([
      expect.objectContaining({
        nickname: "Bea",
        matchesTogether: 3,
        record: { wins: 1, draws: 1, losses: 1 },
        // (1 win + 1 draw * 0.3) / 3 matches
        winRate: 43.33,
      }),
    ]);
  });
});
