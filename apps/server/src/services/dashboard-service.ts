import {
  DashboardRepo,
  DashboardWithDetails,
} from "../repositories/dashboard-repo";
import { UserRepo } from "../repositories/user-repo";
import { transformDashboardServiceToResponse } from "../utils/dashboard-transforms";

export class DashboardService {
  // Business logic: Get dashboard for user
  static async getDashboardForUser(userId: string) {
    const dashboardId = await this.getDashboardIdFromUserId(userId);
    const dashboard = await DashboardRepo.findByIdWithDetails(dashboardId);

    if (!dashboard) {
      throw new Error("Dashboard not found");
    }

    return transformDashboardServiceToResponse(dashboard, userId);
  }

  // Business logic: Get dashboard details by ID with user context
  static async getDashboardDetails(dashboardId: string, userId: string) {
    const dashboard = await DashboardRepo.findByIdWithDetails(dashboardId);

    if (!dashboard) {
      throw new Error("Dashboard not found");
    }

    return transformDashboardServiceToResponse(dashboard, userId);
  }

  // Business logic: Create dashboard for user
  static async createDashboard(userId: string, name: string) {
    // Check if user already has a dashboard
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

  // Business logic: Update dashboard with authorization
  static async updateDashboard(
    dashboardId: string,
    userId: string,
    data: { name?: string }
  ) {
    const dashboard = await DashboardRepo.findById(dashboardId);
    if (!dashboard) {
      throw new Error("Dashboard not found");
    }

    // Check if user is the admin
    if (dashboard.admin_id !== userId) {
      throw new Error("Only dashboard admin can update dashboard");
    }

    return await DashboardRepo.update(dashboardId, data);
  }

  // Business logic: Delete dashboard with authorization
  static async deleteDashboard(dashboardId: string, userId: string) {
    const dashboard = await DashboardRepo.findById(dashboardId);
    if (!dashboard) {
      throw new Error("Dashboard not found");
    }

    // Check if user is the admin
    if (dashboard.admin_id !== userId) {
      throw new Error("Only dashboard admin can delete dashboard");
    }

    return await DashboardRepo.delete(dashboardId);
  }

  // Business logic: Helper methods that were in repository
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

  // Business logic: Check if user can access dashboard
  static async canUserAccessDashboard(
    dashboardId: string,
    userId: string
  ): Promise<boolean> {
    const dashboard = await DashboardRepo.findByIdWithBasic(dashboardId);
    if (!dashboard) return false;

    // User can access if they are admin or a player in the dashboard
    const isAdmin = dashboard.admin_id === userId;
    const isPlayer = dashboard.dashboard_players.some(
      (player) => player.user_id === userId
    );

    return isAdmin || isPlayer;
  }
}
