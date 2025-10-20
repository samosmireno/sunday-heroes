import { Prisma } from "@prisma/client";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";
import prisma from "../prisma-client";

export class CompetitionModeratorRepo {
  static async addModeratorToCompetition(
    competitionId: string,
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;
      await prismaClient.competitionModerator.create({
        data: {
          competitionId,
          dashboardPlayerId: userId,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionModeratorRepo.addModeratorToCompetition"
      );
    }
  }

  static async removeModeratorFromCompetition(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;
      await prismaClient.competitionModerator.deleteMany({
        where: {
          id,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionModeratorRepo.removeModeratorFromCompetition"
      );
    }
  }

  static async getModeratorsByCompetitionId(
    competitionId: string,
    tx?: Prisma.TransactionClient
  ): Promise<string[]> {
    try {
      const prismaClient = tx || prisma;
      const moderators = await prismaClient.competitionModerator.findMany({
        where: { competitionId },
        select: { dashboardPlayerId: true },
      });
      return moderators.map((mod) => mod.dashboardPlayerId);
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionModeratorRepo.getModeratorsByCompetitionId"
      );
    }
  }

  static async getCompetitionIdByModeratorId(
    moderatorId: string,
    tx?: Prisma.TransactionClient
  ): Promise<string | null> {
    try {
      const prismaClient = tx || prisma;
      const competition = await prismaClient.competitionModerator.findFirst({
        where: { id: moderatorId },
        select: { competitionId: true },
      });
      return competition ? competition.competitionId : null;
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionModeratorRepo.getCompetitionIdByModeratorId"
      );
    }
  }

  static async isUserModerator(
    competitionId: string,
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<boolean> {
    try {
      const prismaClient = tx || prisma;
      const count = await prismaClient.competitionModerator.count({
        where: {
          competitionId,
          dashboardPlayerId: userId,
        },
      });
      return count > 0;
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionModeratorRepo.isUserModerator"
      );
    }
  }
}
