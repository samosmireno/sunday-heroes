import { DashboardRepo } from "../repositories/dashboard-repo";
import { transformDashboardToResponse } from "../utils/dashboard-transforms";

export class DashboardService {
  static async getDashboardForUser(userId: string) {
    const dashboard = await DashboardRepo.findByAdminId(userId);

    if (!dashboard) {
      throw new Error("Dashboard not found");
    }

    return transformDashboardToResponse(dashboard);
  }

  static async createDashboard(userId: string, name: string) {
    const existingDashboard = await DashboardRepo.findByAdminId(userId);
    if (existingDashboard) {
      throw new Error("User already has a dashboard");
    }

    return await DashboardRepo.create({
      name,
      admin_id: userId,
      created_at: new Date(),
    });
  }

  static async updateDashboard(
    dashboardId: string,
    userId: string,
    data: { name?: string }
  ) {
    const dashboard = await DashboardRepo.findById(dashboardId);
    if (!dashboard) {
      throw new Error("Dashboard not found");
    }

    if (dashboard.admin_id !== userId) {
      throw new Error("Only dashboard admin can update dashboard");
    }

    return await DashboardRepo.update(dashboardId, data);
  }

  static async deleteDashboard(dashboardId: string, userId: string) {
    const dashboard = await DashboardRepo.findById(dashboardId);
    if (!dashboard) {
      throw new Error("Dashboard not found");
    }

    if (dashboard.admin_id !== userId) {
      throw new Error("Only dashboard admin can delete dashboard");
    }

    return await DashboardRepo.delete(dashboardId);
  }

  static async getDashboardIdFromUserId(userId: string): Promise<string> {
    const dashboard = await DashboardRepo.findByAdminId(userId);
    if (!dashboard) {
      throw new Error(`No dashboard found for user ${userId}`);
    }
    return dashboard.id;
  }

  static async getDashboardIdFromCompetitionId(
    competitionId: string
  ): Promise<string> {
    const dashboard = await DashboardRepo.findByCompetitionId(competitionId);
    if (!dashboard) {
      throw new Error(`No dashboard found for competition ${competitionId}`);
    }
    return dashboard.id;
  }

  static async canUserAccessDashboard(
    dashboardId: string,
    userId: string
  ): Promise<boolean> {
    const dashboard = await DashboardRepo.findByIdWithBasic(dashboardId);
    if (!dashboard) return false;

    const isAdmin = dashboard.admin_id === userId;
    const isPlayer = dashboard.dashboard_players.some(
      (player) => player.user_id === userId
    );

    return isAdmin || isPlayer;
  }
}
