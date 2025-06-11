import { CompetitionType, Prisma } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaTransaction } from "../../types";
import {
  CompetitionWithDetails,
  COMPETITION_DETAILED_INCLUDE,
} from "./competition-repo";

export class CompetitionQueryRepo {
  static async findByType(
    type: CompetitionType,
    options?: { limit?: number; offset?: number },
    tx?: PrismaTransaction
  ): Promise<CompetitionWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.findMany({
        where: { type },
        include: COMPETITION_DETAILED_INCLUDE,
        orderBy: { created_at: "desc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      console.error("Error in CompetitionQueryRepo.findByType:", error);
      throw new Error("Failed to fetch competitions by type");
    }
  }

  static async findByNameSearch(
    searchTerm: string,
    options?: { limit?: number; offset?: number },
    tx?: PrismaTransaction
  ): Promise<CompetitionWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.findMany({
        where: {
          name: {
            startsWith: searchTerm,
            mode: "insensitive",
          },
        },
        include: COMPETITION_DETAILED_INCLUDE,
        orderBy: { created_at: "desc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      console.error("Error in CompetitionQueryRepo.findByNameSearch:", error);
      throw new Error("Failed to search competitions by name");
    }
  }

  static async findByPlayerId(
    playerId: string,
    options?: { limit?: number; offset?: number },
    tx?: PrismaTransaction
  ): Promise<CompetitionWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.findMany({
        where: {
          matches: {
            some: {
              matchPlayers: {
                some: {
                  dashboard_player: { user_id: playerId },
                },
              },
            },
          },
        },
        include: COMPETITION_DETAILED_INCLUDE,
        orderBy: { created_at: "desc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      console.error("Error in CompetitionQueryRepo.findByPlayerId:", error);
      throw new Error("Failed to fetch competitions by player");
    }
  }

  static async findByUserWithFilters(
    userId: string,
    dashboardId: string,
    options: {
      type?: CompetitionType;
      search?: string;
      limit?: number;
      offset?: number;
    } = {},
    tx?: PrismaTransaction
  ): Promise<{ competitions: CompetitionWithDetails[]; totalCount: number }> {
    try {
      const prismaClient = tx || prisma;
      const { type, search, limit, offset } = options;

      const whereClause: Prisma.CompetitionWhereInput = {
        OR: [
          { dashboard_id: dashboardId },
          {
            matches: {
              some: {
                matchPlayers: {
                  some: {
                    dashboard_player: { user_id: userId },
                  },
                },
              },
            },
          },
        ],
        ...(type && { type }),
        ...(search && {
          name: {
            startsWith: search,
            mode: "insensitive" as const,
          },
        }),
      };

      const [competitions, totalCount] = await Promise.all([
        prismaClient.competition.findMany({
          where: whereClause,
          include: COMPETITION_DETAILED_INCLUDE,
          orderBy: { created_at: "desc" },
          take: limit,
          skip: offset,
        }),
        prismaClient.competition.count({
          where: whereClause,
        }),
      ]);

      return { competitions, totalCount };
    } catch (error) {
      console.error(
        "Error in CompetitionQueryRepo.findByUserWithFilters:",
        error
      );
      throw new Error("Failed to fetch competitions with filters");
    }
  }

  static async countByDashboardId(
    dashboardId: string,
    tx?: PrismaTransaction
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.count({
        where: { dashboard_id: dashboardId },
      });
    } catch (error) {
      console.error("Error in CompetitionQueryRepo.countByDashboardId:", error);
      throw new Error("Failed to count competitions by dashboard");
    }
  }
}
