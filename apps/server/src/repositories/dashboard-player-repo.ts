import { DashboardPlayer, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";

const DASHBOARD_PLAYER_BASIC_INCLUDE = {
  user: {
    select: {
      id: true,
      email: true,
    },
  },
} satisfies Prisma.DashboardPlayerInclude;

const DASHBOARD_PLAYER_DETAILED_INCLUDE = {
  user: {
    select: {
      id: true,
      email: true,
      is_registered: true,
    },
  },
  match_players: {
    select: {
      match: {
        select: {
          id: true,
          competition: {
            select: {
              id: true,
              name: true,
            },
          },
          player_votes: true,
        },
      },
      received_votes: true,
      goals: true,
      assists: true,
    },
  },
} satisfies Prisma.DashboardPlayerInclude;

const DASHBOARD_PLAYER_WITH_ADMIN_INCLUDE = {
  dashboard: {
    include: {
      admin: true,
    },
  },
} satisfies Prisma.DashboardPlayerInclude;

export type DashboardPlayerWithUserDetails = Prisma.DashboardPlayerGetPayload<{
  include: typeof DASHBOARD_PLAYER_BASIC_INCLUDE;
}>;

export type DashboardPlayerWithAdmin = Prisma.DashboardPlayerGetPayload<{
  include: typeof DASHBOARD_PLAYER_WITH_ADMIN_INCLUDE;
}>;

export type DashboardPlayerWithDetails = Prisma.DashboardPlayerGetPayload<{
  include: typeof DASHBOARD_PLAYER_DETAILED_INCLUDE;
}>;

export class DashboardPlayerRepo {
  static async findById(
    id: string,
    tx?: PrismaTransaction
  ): Promise<DashboardPlayer | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.findUnique({ where: { id } });
    } catch (error) {
      console.error("Error in DashboardPlayerRepo.findById:", error);
      throw new Error("Failed to fetch dashboard player");
    }
  }

  static async findByIdWithUserDetails(
    id: string,
    tx?: PrismaTransaction
  ): Promise<DashboardPlayerWithUserDetails | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.findUnique({
        where: { id },
        include: DASHBOARD_PLAYER_BASIC_INCLUDE,
      });
    } catch (error) {
      console.error(
        "Error in DashboardPlayerRepo.findByIdWithUserDetails:",
        error
      );
      throw new Error("Failed to fetch dashboard player with user details");
    }
  }

  static async findByIdWithAdmin(
    id: string,
    tx?: PrismaTransaction
  ): Promise<DashboardPlayerWithAdmin | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.findUnique({
        where: { id },
        include: DASHBOARD_PLAYER_WITH_ADMIN_INCLUDE,
      });
    } catch (error) {
      console.error("Error in DashboardPlayerRepo.findByIdWithAdmin:", error);
      throw new Error("Failed to fetch dashboard player with admin details");
    }
  }

  static async findAll(tx?: PrismaTransaction): Promise<DashboardPlayer[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.findMany({
        orderBy: { nickname: "asc" },
      });
    } catch (error) {
      console.error("Error in DashboardPlayerRepo.findAll:", error);
      throw new Error("Failed to fetch dashboard players");
    }
  }

  static async findByDashboardId(
    dashboardId: string,
    options?: { limit?: number; offset?: number },
    tx?: PrismaTransaction
  ): Promise<DashboardPlayerWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.findMany({
        where: { dashboard_id: dashboardId },
        include: DASHBOARD_PLAYER_DETAILED_INCLUDE,
        orderBy: { nickname: "asc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      console.error("Error in DashboardPlayerRepo.findByDashboardId:", error);
      throw new Error("Failed to fetch dashboard players by dashboard");
    }
  }

  static async findByNickname(
    nickname: string,
    dashboardId: string,
    tx?: PrismaTransaction
  ): Promise<DashboardPlayerWithUserDetails | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.findUnique({
        where: {
          dashboard_id_nickname: {
            dashboard_id: dashboardId,
            nickname: nickname,
          },
        },
        include: DASHBOARD_PLAYER_BASIC_INCLUDE,
      });
    } catch (error) {
      console.error("Error in DashboardPlayerRepo.findByNickname:", error);
      throw new Error("Failed to fetch dashboard player by nickname");
    }
  }

  static async findByNicknames(
    nicknames: string[],
    dashboardId: string,
    tx?: PrismaTransaction
  ): Promise<DashboardPlayerWithUserDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.findMany({
        where: {
          dashboard_id: dashboardId,
          nickname: { in: nicknames },
        },
        include: DASHBOARD_PLAYER_BASIC_INCLUDE,
      });
    } catch (error) {
      console.error("Error in DashboardPlayerRepo.findByNicknames:", error);
      throw new Error("Failed to fetch dashboard players by nicknames");
    }
  }

  static async findByUserId(
    userId: string,
    dashboardId: string,
    tx?: PrismaTransaction
  ): Promise<DashboardPlayer | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.findFirst({
        where: {
          dashboard_id: dashboardId,
          user_id: userId,
        },
      });
    } catch (error) {
      console.error("Error in DashboardPlayerRepo.findByUserId:", error);
      throw new Error("Failed to fetch dashboard player by user");
    }
  }

  static async findByNameSearch(
    searchTerm: string,
    dashboardId: string,
    options?: { limit?: number; offset?: number },
    tx?: PrismaTransaction
  ): Promise<DashboardPlayerWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      const DashboardPlayers = await prismaClient.dashboardPlayer.findMany({
        where: {
          dashboard_id: dashboardId,
          nickname: {
            startsWith: searchTerm,
            mode: "insensitive",
          },
        },
        include: DASHBOARD_PLAYER_DETAILED_INCLUDE,
        orderBy: { nickname: "asc" },
        take: options?.limit,
        skip: options?.offset,
      });
      return DashboardPlayers;
    } catch (error) {
      console.error("Error in DashboardPlayerRepo.findByNameSearch:", error);
      throw new Error("Failed to search dashboard players by name");
    }
  }

  static async countByDashboardId(
    dashboardId: string,
    tx?: PrismaTransaction
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.count({
        where: { dashboard_id: dashboardId },
      });
    } catch (error) {
      console.error("Error in DashboardPlayerRepo.countByDashboardId:", error);
      throw new Error("Failed to count dashboard players");
    }
  }

  static async countByNameSearch(
    searchTerm: string,
    dashboardId: string,
    tx?: PrismaTransaction
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.count({
        where: {
          dashboard_id: dashboardId,
          nickname: {
            startsWith: searchTerm,
            mode: "insensitive",
          },
        },
      });
    } catch (error) {
      console.error("Error in DashboardPlayerRepo.countByNameSearch:", error);
      throw new Error("Failed to count dashboard players by search");
    }
  }

  static async create(
    data: Omit<DashboardPlayer, "id">,
    tx?: PrismaTransaction
  ): Promise<DashboardPlayer> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.create({ data });
    } catch (error) {
      console.error("Error in DashboardPlayerRepo.create:", error);
      throw new Error("Failed to create dashboard player");
    }
  }

  static async createMany(
    data: Omit<DashboardPlayer, "id">[],
    tx?: PrismaTransaction
  ): Promise<{ count: number }> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.createMany({ data });
    } catch (error) {
      console.error("Error in DashboardPlayerRepo.createMany:", error);
      throw new Error("Failed to create dashboard players");
    }
  }

  static async update(
    id: string,
    data: Partial<DashboardPlayer>,
    tx?: PrismaTransaction
  ): Promise<DashboardPlayer> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.update({ where: { id }, data });
    } catch (error) {
      console.error("Error in DashboardPlayerRepo.update:", error);
      throw new Error("Failed to update dashboard player");
    }
  }

  static async delete(
    id: string,
    tx?: PrismaTransaction
  ): Promise<DashboardPlayer> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.delete({ where: { id } });
    } catch (error) {
      console.error("Error in DashboardPlayerRepo.delete:", error);
      throw new Error("Failed to delete dashboard player");
    }
  }

  static async deleteMany(
    ids: string[],
    tx?: PrismaTransaction
  ): Promise<{ count: number }> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.deleteMany({
        where: { id: { in: ids } },
      });
    } catch (error) {
      console.error("Error in DashboardPlayerRepo.deleteMany:", error);
      throw new Error("Failed to delete dashboard players");
    }
  }
}
