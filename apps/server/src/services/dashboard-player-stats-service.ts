import { NotFoundError } from "../utils/errors";
import {
  PlayerStatsOverview,
  TopCompetitionsResponse,
  TopMatchesResponse,
} from "@repo/shared-types";
import { DashboardPlayerRepo } from "../repositories/dashboard-player/dashboard-player-repo";
import { DashboardPlayerStatsRepo } from "../repositories/dashboard-player/dashboard-player-stats-repo";
import { transformTopMatchPlayerToMatch } from "../utils/player-stats-transforms";

export class DashboardPlayerStatsService {
  static async getPlayerStats(playerId: string): Promise<PlayerStatsOverview> {
    const player = await DashboardPlayerRepo.findByIdWithUserDetails(playerId);
    if (!player) {
      throw new NotFoundError("Player");
    }

    let careerStats, recentForm;
    if (player.userId) {
      const playerIds = await DashboardPlayerRepo.findDashboardPlayerIdsByUser(
        player.userId
      );

      [careerStats, recentForm] = await Promise.all([
        DashboardPlayerStatsRepo.getPlayerCareerStats(playerIds || [playerId]),
        DashboardPlayerStatsRepo.getRecentForm(playerIds || [playerId], 5),
      ]);
    } else {
      [careerStats, recentForm] = await Promise.all([
        DashboardPlayerStatsRepo.getPlayerCareerStats([playerId]),
        DashboardPlayerStatsRepo.getRecentForm([playerId], 5),
      ]);
    }

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
    const player = await DashboardPlayerRepo.findById(playerId);
    if (!player) {
      throw new NotFoundError("Player");
    }

    let topMatchPlayers;
    if (player.userId) {
      const playerIds = await DashboardPlayerRepo.findDashboardPlayerIdsByUser(
        player.userId
      );

      topMatchPlayers = await DashboardPlayerStatsRepo.getTopMatches(
        playerIds || [playerId]
      );
    } else {
      topMatchPlayers = await DashboardPlayerStatsRepo.getTopMatches([
        playerId,
      ]);
    }
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
    const player = await DashboardPlayerRepo.findById(playerId);
    if (!player) {
      throw new NotFoundError("Player");
    }

    let competitionStats;
    if (player.userId) {
      const playerIds = await DashboardPlayerRepo.findDashboardPlayerIdsByUser(
        player.userId
      );

      competitionStats = await DashboardPlayerStatsRepo.getCompetitionStats(
        playerIds || [playerId]
      );
    } else {
      competitionStats = await DashboardPlayerStatsRepo.getCompetitionStats([
        playerId,
      ]);
    }

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
}
