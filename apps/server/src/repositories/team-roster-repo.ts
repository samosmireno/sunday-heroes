import { PrismaTransaction } from "../types";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";
import prisma from "./prisma-client";
import { TeamRoster } from "@prisma/client";

export class TeamRosterRepo {
  static async addPlayerToTeam(
    teamId: string,
    dashboardPlayerId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<TeamRoster> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.teamRoster.create({
        data: {
          teamId,
          dashboardPlayerId,
          competitionId,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRosterRepo.addPlayerToTeam");
    }
  }

  static async removePlayerFromTeam(
    teamId: string,
    dashboardPlayerId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;
      await prismaClient.teamRoster.delete({
        where: {
          teamId_dashboardPlayerId_competitionId: {
            teamId,
            dashboardPlayerId,
            competitionId,
          },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamRosterRepo.removePlayerFromTeam"
      );
    }
  }

  static async getTeamRoster(
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ) {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.teamRoster.findMany({
        where: {
          teamId,
          competitionId,
        },
        include: {
          dashboardPlayer: true,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRosterRepo.getTeamRoster");
    }
  }

  static async getPlayerTeamInCompetition(
    dashboardPlayerId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ) {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.teamRoster.findFirst({
        where: {
          dashboardPlayerId,
          competitionId,
        },
        include: {
          team: true,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamRosterRepo.getPlayerTeamInCompetition"
      );
    }
  }

  static async getTeamPlayerCount(
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.teamRoster.count({
        where: {
          teamId,
          competitionId,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamRosterRepo.getTeamPlayerCount"
      );
    }
  }

  static async isPlayerOnTeam(
    dashboardPlayerId: string,
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<boolean> {
    try {
      const prismaClient = tx || prisma;
      const roster = await prismaClient.teamRoster.findUnique({
        where: {
          teamId_dashboardPlayerId_competitionId: {
            teamId,
            dashboardPlayerId,
            competitionId,
          },
        },
      });
      return !!roster;
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRosterRepo.isPlayerOnTeam");
    }
  }
}
