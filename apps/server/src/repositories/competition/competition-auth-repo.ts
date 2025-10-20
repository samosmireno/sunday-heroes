import { CompetitionType, Prisma } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";

export class CompetitionAuthRepo {
  static async getCompetitionType(
    id: string,
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
  ): Promise<string | null> {
    try {
      const prismaClient = tx || prisma;
      const competition = await prismaClient.competition.findUnique({
        where: { id },
        select: {
          dashboard: {
            select: {
              adminId: true,
            },
          },
        },
      });
      return competition?.dashboard.adminId || null;
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionAuthRepo.getDashboardAdmin"
      );
    }
  }

  static async getModerators(
    competitionId: string,
    tx?: Prisma.TransactionClient
  ): Promise<string[]> {
    try {
      const prismaClient = tx || prisma;
      const moderators = await prismaClient.competitionModerator.findMany({
        where: { competitionId },
        select: {
          dashboardPlayer: {
            select: {
              userId: true,
            },
          },
        },
      });
      return moderators
        .map((m) => m.dashboardPlayer.userId)
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
    tx?: Prisma.TransactionClient
  ): Promise<boolean> {
    const adminId = await this.getDashboardAdmin(competitionId, tx);
    return adminId === userId;
  }

  static async isUserAdminOrModerator(
    competitionId: string,
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<boolean> {
    const [adminId, moderatorIds] = await Promise.all([
      this.getDashboardAdmin(competitionId, tx),
      this.getModerators(competitionId, tx),
    ]);
    return adminId === userId || moderatorIds.includes(userId);
  }
}
