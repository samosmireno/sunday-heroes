import { NotFoundError } from "../utils/errors";
import { DashboardPlayerRepo } from "../repositories/dashboard-player/dashboard-player-repo";
import { DashboardPlayerStatsRepo } from "../repositories/dashboard-player/dashboard-player-stats-repo";

export class DashboardPlayerStatsService {
  static async getPlayerStats(playerId: string) {
    const player = await DashboardPlayerRepo.findByIdWithUserDetails(playerId);
    if (!player) {
      throw new NotFoundError("Player");
    }

    const [careerStats, recentForm] = await Promise.all([
      DashboardPlayerStatsRepo.getPlayerCareerStats(playerId),
      DashboardPlayerStatsRepo.getRecentForm(playerId, 5),
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
}
