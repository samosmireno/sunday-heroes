import { Dashboard, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";

const DASHBOARD_BASIC_INCLUDE = {
  admin: true,
  dashboardPlayers: true,
} satisfies Prisma.DashboardInclude;

const DASHBOARD_DETAILED_INCLUDE = {
  admin: true,
  dashboardPlayers: true,
  competitions: {
    include: {
      moderators: {
        include: {
          dashboardPlayer: {
            select: {
              nickname: true,
            },
          },
        },
      },
      matches: {
        include: {
          matchPlayers: {
            include: {
              dashboardPlayer: {
                include: {
                  votesGiven: true,
                },
              },
              receivedVotes: true,
            },
          },
          matchTeams: {
            include: {
              team: true,
            },
          },
          playerVotes: true,
        },
      },
    },
  },
} satisfies Prisma.DashboardInclude;

export type DashboardWithBasic = Prisma.DashboardGetPayload<{
  include: typeof DASHBOARD_BASIC_INCLUDE;
}>;

export type DashboardWithDetails = Prisma.DashboardGetPayload<{
  include: typeof DASHBOARD_DETAILED_INCLUDE;
}>;

export class DashboardRepo {
  static async findById(
    id: string,
    tx?: PrismaTransaction
  ): Promise<Dashboard | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboard.findUnique({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "DashboardRepo.findById");
    }
  }

  static async findByIdWithBasic(
    id: string,
    tx?: PrismaTransaction
  ): Promise<DashboardWithBasic | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboard.findUnique({
        where: { id },
        include: DASHBOARD_BASIC_INCLUDE,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "DashboardRepo.findByIdWithBasic");
    }
  }

  static async findByIdWithDetails(
    id: string,
    tx?: PrismaTransaction
  ): Promise<DashboardWithDetails | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboard.findUnique({
        where: { id },
        include: DASHBOARD_DETAILED_INCLUDE,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardRepo.findByIdWithDetails"
      );
    }
  }

  static async findByAdminId(
    adminId: string,
    tx?: PrismaTransaction
  ): Promise<DashboardWithDetails | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboard.findUnique({
        where: { adminId },
        include: DASHBOARD_DETAILED_INCLUDE,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "DashboardRepo.findByAdminId");
    }
  }

  static async findByCompetitionId(
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<Dashboard | null> {
    try {
      const prismaClient = tx || prisma;
      const competition = await prismaClient.competition.findUnique({
        where: { id: competitionId },
        select: {
          dashboard: true,
        },
      });
      return competition?.dashboard || null;
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardRepo.findByCompetitionId"
      );
    }
  }

  static async findAll(tx?: PrismaTransaction): Promise<Dashboard[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboard.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "DashboardRepo.findAll");
    }
  }

  static async create(
    data: Omit<Dashboard, "id">,
    tx?: PrismaTransaction
  ): Promise<Dashboard> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboard.create({ data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "DashboardRepo.create");
    }
  }

  static async update(
    id: string,
    data: Partial<Dashboard>,
    tx?: PrismaTransaction
  ): Promise<Dashboard> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboard.update({ where: { id }, data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "DashboardRepo.update");
    }
  }

  static async delete(id: string, tx?: PrismaTransaction): Promise<Dashboard> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboard.delete({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "DashboardRepo.delete");
    }
  }
}
