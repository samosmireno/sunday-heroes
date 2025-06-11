import { CompetitionType } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaTransaction } from "../../types";

export class CompetitionAuthRepo {
  static async getCompetitionType(
    id: string,
    tx?: PrismaTransaction
  ): Promise<CompetitionType | null> {
    try {
      const prismaClient = tx || prisma;
      const competition = await prismaClient.competition.findUnique({
        where: { id },
        select: { type: true },
      });
      return competition?.type || null;
    } catch (error) {
      console.error("Error in CompetitionAuthRepo.getCompetitionType:", error);
      throw new Error("Failed to get competition type");
    }
  }

  static async getDashboardAdmin(
    id: string,
    tx?: PrismaTransaction
  ): Promise<string | null> {
    try {
      const prismaClient = tx || prisma;
      const competition = await prismaClient.competition.findUnique({
        where: { id },
        select: {
          dashboard: {
            select: {
              admin_id: true,
            },
          },
        },
      });
      return competition?.dashboard.admin_id || null;
    } catch (error) {
      console.error("Error in CompetitionAuthRepo.getDashboardAdmin:", error);
      throw new Error("Failed to get dashboard admin");
    }
  }

  static async getModerators(
    id: string,
    tx?: PrismaTransaction
  ): Promise<string[]> {
    try {
      const prismaClient = tx || prisma;
      const moderators = await prismaClient.competitionModerator.findMany({
        where: { competition_id: id },
        select: {
          dashboard_player: {
            select: {
              user_id: true,
            },
          },
        },
      });
      return moderators
        .map((m) => m.dashboard_player.user_id)
        .filter((userId): userId is string => userId !== null);
    } catch (error) {
      console.error("Error in CompetitionAuthRepo.getModerators:", error);
      throw new Error("Failed to get moderators");
    }
  }

  static async isUserAdmin(
    competitionId: string,
    userId: string
  ): Promise<boolean> {
    const adminId = await this.getDashboardAdmin(competitionId);
    return adminId === userId;
  }

  static async isUserAdminOrModerator(
    competitionId: string,
    userId: string
  ): Promise<boolean> {
    const [adminId, moderatorIds] = await Promise.all([
      this.getDashboardAdmin(competitionId),
      this.getModerators(competitionId),
    ]);
    return adminId === userId || moderatorIds.includes(userId);
  }
}
