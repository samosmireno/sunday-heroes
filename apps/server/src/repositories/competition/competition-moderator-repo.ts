import { PrismaTransaction } from "../../types";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";
import prisma from "../prisma-client";

export class CompetitionModeratorRepo {
  static async addModeratorToCompetition(
    competition_id: string,
    userId: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;
      await prismaClient.competitionModerator.create({
        data: {
          competition_id,
          dashboard_player_id: userId,
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
    tx?: PrismaTransaction
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
    competition_id: string,
    tx?: PrismaTransaction
  ): Promise<string[]> {
    try {
      const prismaClient = tx || prisma;
      const moderators = await prismaClient.competitionModerator.findMany({
        where: { competition_id },
        select: { dashboard_player_id: true },
      });
      return moderators.map((mod) => mod.dashboard_player_id);
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionModeratorRepo.getModeratorsByCompetitionId"
      );
    }
  }

  static async getCompetitionIdByModeratorId(
    moderatorId: string,
    tx?: PrismaTransaction
  ): Promise<string | null> {
    try {
      const prismaClient = tx || prisma;
      const competition = await prismaClient.competitionModerator.findFirst({
        where: { id: moderatorId },
        select: { competition_id: true },
      });
      return competition ? competition.competition_id : null;
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionModeratorRepo.getCompetitionIdByModeratorId"
      );
    }
  }

  static async isUserModerator(
    competition_id: string,
    userId: string,
    tx?: PrismaTransaction
  ): Promise<boolean> {
    try {
      const prismaClient = tx || prisma;
      const count = await prismaClient.competitionModerator.count({
        where: {
          competition_id,
          dashboard_player_id: userId,
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
