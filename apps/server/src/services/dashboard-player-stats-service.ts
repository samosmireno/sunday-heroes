import { NotFoundError } from "../utils/errors";
import {
  PerformanceChartResponse,
  PlayerStatsOverview,
  TeammateStats,
  TopCompetitionsResponse,
  TopMatchesResponse,
} from "@repo/shared-types";
import { DashboardPlayerRepo } from "../repositories/dashboard-player/dashboard-player-repo";
import { DashboardPlayerStatsRepo } from "../repositories/dashboard-player/dashboard-player-stats-repo";
import {
  transformMatchPlayerToPerformanceData,
  transformTopMatchPlayerToMatch,
} from "../utils/player-stats-transforms";

export class DashboardPlayerStatsService {
  static async getPlayerStats(playerId: string): Promise<PlayerStatsOverview> {
    const { player, playerIds } = await this.getPlayerAndRelatedIds(
      playerId,
      true
    );

    const [careerStats, recentForm] = await Promise.all([
      DashboardPlayerStatsRepo.getPlayerCareerStats(playerIds),
      DashboardPlayerStatsRepo.getRecentForm(playerIds, 5),
    ]);

    return {
      player: {
        id: player.id,
        nickname: player.nickname,
        userId: player.userId,
        isRegistered: !!player.user,
      },
      careerStats: {
        totalMatches: careerStats.totalMatches,
        totalGoals: careerStats.totalGoals,
        totalAssists: careerStats.totalAssists,
        avgRating: careerStats.avgRating,
        totalCompetitions: careerStats.totalCompetitions,
        record: careerStats.record,
        manOfTheMatchCount: careerStats.manOfTheMatchCount,
      },
      recentForm,
    };
  }

  static async getTopMatches(playerId: string): Promise<TopMatchesResponse> {
    const { playerIds } = await this.getPlayerAndRelatedIds(playerId);

    const topMatchPlayers =
      await DashboardPlayerStatsRepo.getTopMatches(playerIds);

    const topMatches: TopMatchesResponse = {
      topGoals: transformTopMatchPlayerToMatch(topMatchPlayers.topGoals),
      topAssists: transformTopMatchPlayerToMatch(topMatchPlayers.topAssists),
      topRating: transformTopMatchPlayerToMatch(topMatchPlayers.topRating),
    };

    return topMatches;
  }

  static async getTopCompetitions(
    playerId: string
  ): Promise<TopCompetitionsResponse> {
    const { playerIds } = await this.getPlayerAndRelatedIds(playerId);

    const competitionStats =
      await DashboardPlayerStatsRepo.getCompetitionStats(playerIds);

    const topGoals = competitionStats.find(
      (stat) =>
        stat.totalGoals ===
        Math.max(...competitionStats.map((s) => s.totalGoals))
    );

    const topAssists = competitionStats.find(
      (stat) =>
        stat.totalAssists ===
        Math.max(...competitionStats.map((s) => s.totalAssists))
    );

    const topRating = competitionStats.find(
      (stat) =>
        stat.avgRating === Math.max(...competitionStats.map((s) => s.avgRating))
    );

    return {
      topGoals: topGoals ?? null,
      topAssists: topAssists ?? null,
      topRating: topRating ?? null,
    };
  }

  static async getPerformanceChart(
    playerId: string,
    competitionId: string,
    range?: number
  ): Promise<PerformanceChartResponse> {
    const { playerIds } = await this.getPlayerAndRelatedIds(playerId);

    const matchPlayers = await DashboardPlayerStatsRepo.getPerformanceData(
      playerIds,
      competitionId,
      range
    );

    return {
      matches: transformMatchPlayerToPerformanceData(matchPlayers),
      range,
      competitionId,
    };
  }

  static async getStatsByCompetition(
    playerId: string
  ): Promise<import("@repo/shared-types").PlayerCompetitionStats[]> {
    const { playerIds } = await this.getPlayerAndRelatedIds(playerId);

    const stats =
      await DashboardPlayerStatsRepo.getPlayerCompetitionStats(playerIds);
    return stats;
  }

  static async getTopTeammates(playerId: string): Promise<TeammateStats[]> {
    const { playerIds } = await this.getPlayerAndRelatedIds(playerId);

    const topTeammates =
      await DashboardPlayerStatsRepo.getTopTeammates(playerIds);

    return topTeammates;
  }

  private static async getPlayerAndRelatedIds(
    playerId: string,
    includeUserDetails: boolean = false
  ): Promise<{ player: any; playerIds: string[] }> {
    const player = includeUserDetails
      ? await DashboardPlayerRepo.findByIdWithUserDetails(playerId)
      : await DashboardPlayerRepo.findById(playerId);

    if (!player) {
      throw new NotFoundError("Player");
    }

    let playerIds: string[] = [playerId];
    if (player.userId) {
      const relatedIds = await DashboardPlayerRepo.findDashboardPlayerIdsByUser(
        player.userId
      );
      playerIds = relatedIds || [playerId];
    }

    return { player, playerIds };
  }
}
