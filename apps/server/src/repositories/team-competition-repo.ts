import prisma from "./prisma-client";
import { Prisma, TeamCompetition } from "@prisma/client";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";
import { NotFoundError } from "../utils/errors";

export type TeamCompetitionWithDetails = Prisma.TeamCompetitionGetPayload<{
  include: {
    team: true;
  };
}>;

export class TeamCompetitionRepo {
  static async getTeamsFromCompetitionId(
    competitionId: string,
    tx?: Prisma.TransactionClient
  ): Promise<string[]> {
    try {
      const prismaClient = tx || prisma;
      const teams = await prismaClient.teamCompetition.findMany({
        where: { competitionId },
        select: {
          team: {
            select: {
              name: true,
            },
          },
        },
      });
      return teams.map((tc) => tc.team.name);
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.getTeamsFromCompetitionId"
      );
    }
  }

  static async getTeamCompetitionStats(
    teamId: string,
    competitionId: string,
    tx?: Prisma.TransactionClient
  ): Promise<TeamCompetition | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.teamCompetition.findUnique({
        where: {
          teamId_competitionId: {
            teamId,
            competitionId,
          },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.getTeamCompetitionStats"
      );
    }
  }

  static async incrementTeamStats(
    teamId: string,
    competitionId: string,
    updates: {
      points?: number;
      wins?: number;
      draws?: number;
      losses?: number;
      goalsFor?: number;
      goalsAgainst?: number;
    },
    tx?: Prisma.TransactionClient
  ): Promise<TeamCompetition> {
    try {
      const prismaClient = tx || prisma;

      const current = await this.getTeamCompetitionStats(
        teamId,
        competitionId,
        tx
      );
      if (!current) {
        throw new NotFoundError("Team competition record not found");
      }

      return await prismaClient.teamCompetition.update({
        where: {
          teamId_competitionId: {
            teamId,
            competitionId,
          },
        },
        data: {
          points: current.points + (updates.points || 0),
          wins: current.wins + (updates.wins || 0),
          draws: current.draws + (updates.draws || 0),
          losses: current.losses + (updates.losses || 0),
          goalsFor: current.goalsFor + (updates.goalsFor || 0),
          goalsAgainst: current.goalsAgainst + (updates.goalsAgainst || 0),
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.incrementTeamStats"
      );
    }
  }

  static async resetTeamStats(
    teamId: string,
    competitionId: string,
    tx?: Prisma.TransactionClient
  ): Promise<TeamCompetition> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.teamCompetition.update({
        where: {
          teamId_competitionId: {
            teamId,
            competitionId,
          },
        },
        data: {
          points: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.resetTeamStats"
      );
    }
  }

  static async getAllTeamsInCompetition(
    competitionId: string,
    tx?: Prisma.TransactionClient
  ) {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.teamCompetition.findMany({
        where: { competitionId },
        include: {
          team: {
            include: {
              teamRosters: {
                where: { competitionId },
                include: {
                  dashboardPlayer: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.getAllTeamsInCompetition"
      );
    }
  }

  static async getTeamCompetitionsForLeague(
    competitionId: string,
    tx?: Prisma.TransactionClient
  ) {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.teamCompetition.findMany({
        where: { competitionId },
        include: {
          team: true,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.getTeamCompetitionsForLeague"
      );
    }
  }

  static async createTeamCompetition(
    teamId: string,
    competitionId: string,
    tx?: Prisma.TransactionClient
  ): Promise<TeamCompetition> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.teamCompetition.create({
        data: {
          teamId,
          competitionId,
          points: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.createTeamCompetition"
      );
    }
  }

  static async deleteTeamFromCompetition(
    teamId: string,
    competitionId: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;
      await prismaClient.teamCompetition.delete({
        where: {
          teamId_competitionId: {
            teamId,
            competitionId,
          },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.deleteTeamFromCompetition"
      );
    }
  }

  static async addTeamToCompetition(
    teamId: string,
    competitionId: string
  ): Promise<TeamCompetition> {
    try {
      return await prisma.teamCompetition.create({
        data: {
          teamId,
          competitionId,
          points: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.addTeamToCompetition"
      );
    }
  }

  static async bulkResetStats(
    competitionId: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;
      await prismaClient.teamCompetition.updateMany({
        where: { competitionId },
        data: {
          points: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.bulkResetStats"
      );
    }
  }

  static async findByTeamAndCompetition(
    teamId: string,
    competitionId: string,
    tx?: Prisma.TransactionClient
  ): Promise<TeamCompetition | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.teamCompetition.findUnique({
        where: {
          teamId_competitionId: {
            teamId,
            competitionId,
          },
        },
        include: {
          team: true,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.findByTeamAndCompetition"
      );
    }
  }

  static async updateTeamId(
    oldTeamId: string,
    newTeamId: string,
    competitionId: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;
      await prismaClient.teamCompetition.update({
        where: {
          teamId_competitionId: {
            teamId: oldTeamId,
            competitionId,
          },
        },
        data: {
          teamId: newTeamId,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.updateTeamId"
      );
    }
  }
}
