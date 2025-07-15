import { Team, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";

const TEAM_WITH_COMPETITIONS_INCLUDE = {
  teamCompetitions: true,
  teamRosters: {
    include: {
      dashboardPlayer: true,
    },
  },
} satisfies Prisma.TeamInclude;

const TEAM_IN_COMPETITION_INCLUDE = {
  teamCompetitions: {
    include: {
      competition: true,
    },
  },
  teamRosters: {
    include: {
      dashboardPlayer: true,
    },
  },
} satisfies Prisma.TeamInclude;

export type TeamWithCompetitions = Prisma.TeamGetPayload<{
  include: typeof TEAM_WITH_COMPETITIONS_INCLUDE;
}>;

export type TeamInCompetition = Prisma.TeamGetPayload<{
  include: typeof TEAM_IN_COMPETITION_INCLUDE;
}>;

export class TeamRepo {
  static async findById(
    id: string,
    tx?: PrismaTransaction
  ): Promise<Team | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.team.findUnique({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRepo.findById");
    }
  }

  static async findByName(
    name: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<Team | null> {
    try {
      const prismaClient = tx || prisma;
      const team = await prismaClient.team.findFirst({
        where: {
          name,
          teamCompetitions: {
            some: { competitionId },
          },
        },
      });

      return team;
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRepo.findByName");
    }
  }

  static async findAll(tx?: PrismaTransaction): Promise<Team[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.team.findMany({
        orderBy: { name: "asc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRepo.findAll");
    }
  }

  static async findByCompetitionId(
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<TeamInCompetition[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.team.findMany({
        where: {
          teamCompetitions: {
            some: { competitionId },
          },
        },
        include: {
          teamCompetitions: {
            where: { competitionId },
            include: {
              competition: true,
            },
          },
          teamRosters: {
            where: { competitionId },
            include: {
              dashboardPlayer: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRepo.findByCompetitionId");
    }
  }

  static async create(
    data: Omit<Team, "id">,
    tx?: PrismaTransaction
  ): Promise<Team> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.team.create({ data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRepo.create");
    }
  }

  static async update(
    id: string,
    data: Partial<Team>,
    tx?: PrismaTransaction
  ): Promise<Team> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.team.update({ where: { id }, data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRepo.update");
    }
  }

  static async delete(id: string, tx?: PrismaTransaction): Promise<Team> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.team.delete({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRepo.delete");
    }
  }

  static async deleteMany(
    ids: string[],
    tx?: PrismaTransaction
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;
      await prismaClient.team.deleteMany({
        where: {
          id: { in: ids },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRepo.deleteMany");
    }
  }

  static async checkNameUnique(
    name: string,
    excludeId?: string,
    tx?: PrismaTransaction
  ): Promise<boolean> {
    try {
      const prismaClient = tx || prisma;
      const existing = await prismaClient.team.findFirst({
        where: {
          name,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });
      return !existing;
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRepo.checkNameUnique");
    }
  }

  static async checkNameUniqueInCompetition(
    name: string,
    competitionId: string,
    excludeTeamId?: string,
    tx?: PrismaTransaction
  ): Promise<boolean> {
    try {
      const prismaClient = tx || prisma;
      const existing = await prismaClient.team.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: "insensitive",
          },
          teamCompetitions: {
            some: {
              competitionId,
            },
          },
          ...(excludeTeamId && {
            id: {
              not: excludeTeamId,
            },
          }),
        },
      });
      return !existing;
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamRepo.checkNameUniqueInCompetition"
      );
    }
  }

  static async getTeamIDFromName(
    team_name: string,
    competition_id: string
  ): Promise<string> {
    try {
      const team = await this.findByName(team_name, competition_id);
      if (!team) {
        throw new Error(`Team with name ${team_name} not found`);
      }
      return team.id;
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRepo.getTeamIDFromName");
    }
  }

  static async findByNameInDashboard(
    name: string,
    dashboardId: string,
    tx?: PrismaTransaction
  ): Promise<Team | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.team.findFirst({
        where: {
          name: { equals: name.trim(), mode: "insensitive" },
          teamCompetitions: {
            some: {
              competition: { dashboardId },
            },
          },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRepo.findByNameInDashboard");
    }
  }
}
