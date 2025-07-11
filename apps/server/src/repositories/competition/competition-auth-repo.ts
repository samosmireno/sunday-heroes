import { CompetitionType } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaTransaction } from "../../types";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";

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
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionAuthRepo.getCompetitionType"
      );
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
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionAuthRepo.getDashboardAdmin"
      );
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
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionAuthRepo.getModerators"
      );
    }
  }

  static async isUserAdmin(
    competitionId: string,
    userId: string,
    tx?: PrismaTransaction
  ): Promise<boolean> {
    const adminId = await this.getDashboardAdmin(competitionId, tx);
    return adminId === userId;
  }

  static async isUserAdminOrModerator(
    competitionId: string,
    userId: string,
    tx?: PrismaTransaction
  ): Promise<boolean> {
    const [adminId, moderatorIds] = await Promise.all([
      this.getDashboardAdmin(competitionId, tx),
      this.getModerators(competitionId, tx),
    ]);
    return adminId === userId || moderatorIds.includes(userId);
  }
}
