import { Dashboard, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";

const DASHBOARD_BASIC_INCLUDE = {
  admin: true,
  dashboard_players: true,
} satisfies Prisma.DashboardInclude;

const DASHBOARD_DETAILED_INCLUDE = {
  admin: true,
  dashboard_players: true,
  competitions: {
    include: {
      moderators: {
        include: {
          dashboard_player: {
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
              dashboard_player: {
                include: {
                  votes_given: true,
                },
              },
              received_votes: true,
            },
          },
          match_teams: {
            include: {
              team: true,
            },
          },
          player_votes: true,
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
      console.error("Error in DashboardRepo.findById:", error);
      throw new Error("Failed to fetch dashboard");
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
      console.error("Error in DashboardRepo.findByIdWithBasic:", error);
      throw new Error("Failed to fetch dashboard with basic details");
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
      console.error("Error in DashboardRepo.findByIdWithDetails:", error);
      throw new Error("Failed to fetch dashboard with details");
    }
  }

  static async findByAdminId(
    adminId: string,
    tx?: PrismaTransaction
  ): Promise<Dashboard | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboard.findUnique({
        where: { admin_id: adminId },
      });
    } catch (error) {
      console.error("Error in DashboardRepo.findByAdminId:", error);
      throw new Error("Failed to fetch dashboard by admin");
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
      console.error("Error in DashboardRepo.findByCompetitionId:", error);
      throw new Error("Failed to fetch dashboard by competition");
    }
  }

  static async findAll(tx?: PrismaTransaction): Promise<Dashboard[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboard.findMany({
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error in DashboardRepo.findAll:", error);
      throw new Error("Failed to fetch dashboards");
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
      console.error("Error in DashboardRepo.create:", error);
      throw new Error("Failed to create dashboard");
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
      console.error("Error in DashboardRepo.update:", error);
      throw new Error("Failed to update dashboard");
    }
  }

  static async delete(id: string, tx?: PrismaTransaction): Promise<Dashboard> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboard.delete({ where: { id } });
    } catch (error) {
      console.error("Error in DashboardRepo.delete:", error);
      throw new Error("Failed to delete dashboard");
    }
  }
}
