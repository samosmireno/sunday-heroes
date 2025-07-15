import { MatchTeam, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";

export class MatchTeamRepo {
  static async createMatchTeams(
    data: Omit<MatchTeam, "id">[],
    tx?: PrismaTransaction
  ): Promise<{ count: number }> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchTeam.createMany({ data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchTeamRepo.createMatchTeams");
    }
  }

  static async create(
    matchId: string,
    teamId: string,
    isHome: boolean,
    tx?: PrismaTransaction
  ): Promise<MatchTeam> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchTeam.create({
        data: {
          matchId,
          teamId,
          isHome,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchTeamRepo.create");
    }
  }

  static async findByMatchId(
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<MatchTeam[]> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchTeam.findMany({
        where: { matchId },
        include: {
          team: true,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchTeamRepo.findByMatchId");
    }
  }

  static async findByTeamId(
    teamId: string,
    tx?: PrismaTransaction
  ): Promise<MatchTeam[]> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchTeam.findMany({
        where: { teamId },
        include: {
          match: true,
          team: true,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchTeamRepo.findByTeamId");
    }
  }

  static async findByMatchAndTeam(
    matchId: string,
    teamId: string,
    tx?: PrismaTransaction
  ): Promise<MatchTeam | null> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchTeam.findFirst({
        where: {
          matchId,
          teamId,
        },
        include: {
          team: true,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchTeamRepo.findByMatchAndTeam"
      );
    }
  }

  static async getHomeTeam(
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<MatchTeam | null> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchTeam.findFirst({
        where: {
          matchId,
          isHome: true,
        },
        include: {
          team: true,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchTeamRepo.getHomeTeam");
    }
  }

  static async getAwayTeam(
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<MatchTeam | null> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchTeam.findFirst({
        where: {
          matchId,
          isHome: false,
        },
        include: {
          team: true,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchTeamRepo.getAwayTeam");
    }
  }

  static async deleteByMatchId(
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<{ count: number }> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchTeam.deleteMany({
        where: { matchId },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchTeamRepo.deleteByMatchId");
    }
  }

  static async deleteByTeamId(
    teamId: string,
    tx?: PrismaTransaction
  ): Promise<{ count: number }> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchTeam.deleteMany({
        where: { teamId },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchTeamRepo.deleteByTeamId");
    }
  }

  static async update(
    id: string,
    data: Partial<MatchTeam>,
    tx?: PrismaTransaction
  ): Promise<MatchTeam> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchTeam.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchTeamRepo.update");
    }
  }

  static async delete(id: string, tx?: PrismaTransaction): Promise<MatchTeam> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchTeam.delete({
        where: { id },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchTeamRepo.delete");
    }
  }

  static async findTeamMatches(
    teamId: string,
    competitionId?: string,
    tx?: PrismaTransaction
  ): Promise<MatchTeam[]> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchTeam.findMany({
        where: {
          teamId,
          ...(competitionId && {
            match: {
              competitionId,
            },
          }),
        },
        include: {
          match: {
            include: {
              matchTeams: {
                include: {
                  team: true,
                },
              },
            },
          },
          team: true,
        },
        orderBy: {
          match: {
            date: "desc",
          },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchTeamRepo.findTeamMatches");
    }
  }

  static async updateTeamReferences(
    oldTeamId: string,
    newTeamId: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;
      await prismaClient.matchTeam.updateMany({
        where: { teamId: oldTeamId },
        data: { teamId: newTeamId },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchTeamRepo.updateTeamReferences"
      );
    }
  }
}
