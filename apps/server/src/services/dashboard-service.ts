import { CompetitionRepo } from "../repositories/competition/competition-repo";
import { DashboardRepo } from "../repositories/dashboard/dashboard-repo";
import { MatchRepo } from "../repositories/match/match-repo";
import { extractDashboardData } from "../utils/dashboard-transforms";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from "../utils/errors";

export class DashboardService {
  static async getDashboardPlayerDetailsForUser(userId: string) {
    // const dashboardIds =
    //   await DashboardPlayerRepo.findDashboardIdsByUser(userId);
    // if (!dashboardIds) throw new NotFoundError("DashboardPlayer");

    const competitionIdsForUser =
      await CompetitionRepo.findCompetitionIdsForUserIncludingAdmin(userId);

    const competitions = await CompetitionRepo.findCompetitionsByIds(
      competitionIdsForUser
    );

    const competitionIds = competitions.map((c) => c.id);

    const matches = await MatchRepo.findMatchesForCompetitions(competitionIds);

    return extractDashboardData(competitions, matches);
  }

  static async createDashboard(userId: string, name: string) {
    const existingDashboard = await DashboardRepo.findByAdminId(userId);
    if (existingDashboard) {
      throw new ConflictError(
        "User already has a dashboard. Only one dashboard per user is allowed."
      );
    }

    return await DashboardRepo.create({
      name,
      adminId: userId,
      createdAt: new Date(),
    });
  }

  static async updateDashboard(
    dashboardId: string,
    userId: string,
    data: { name?: string }
  ) {
    const dashboard = await DashboardRepo.findById(dashboardId);
    if (!dashboard) {
      throw new NotFoundError("Dashboard");
    }

    if (dashboard.adminId !== userId) {
      throw new AuthorizationError("Only dashboard admin can update dashboard");
    }

    return await DashboardRepo.update(dashboardId, data);
  }

  static async deleteDashboard(dashboardId: string, userId: string) {
    const dashboard = await DashboardRepo.findById(dashboardId);
    if (!dashboard) {
      throw new NotFoundError("Dashboard");
    }

    if (dashboard.adminId !== userId) {
      throw new AuthorizationError("Only dashboard admin can delete dashboard");
    }

    return await DashboardRepo.delete(dashboardId);
  }

  static async getDashboardIdFromUserId(userId: string): Promise<string> {
    const dashboard = await DashboardRepo.findByAdminId(userId);
    if (!dashboard) {
      throw new NotFoundError("Dashboard");
    }
    return dashboard.id;
  }

  static async getDashboardIdFromCompetitionId(
    competitionId: string
  ): Promise<string> {
    const dashboard = await DashboardRepo.findByCompetitionId(competitionId);
    if (!dashboard) {
      throw new NotFoundError("Dashboard");
    }
    return dashboard.id;
  }

  static async canUserAccessDashboard(
    dashboardId: string,
    userId: string
  ): Promise<boolean> {
    const dashboard = await DashboardRepo.findByIdWithBasic(dashboardId);
    if (!dashboard) return false;

    const isAdmin = dashboard.adminId === userId;
    const isPlayer = dashboard.dashboardPlayers.some(
      (player) => player.userId === userId
    );

    return isAdmin || isPlayer;
  }
}
