import { CompetitionType, Prisma } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaTransaction } from "../../types";
import {
  CompetitionWithDetails,
  COMPETITION_DETAILED_INCLUDE,
} from "./competition-repo";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";

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
        orderBy: { createdAt: "desc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "CompetitionQueryRepo.findByType");
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
        orderBy: { createdAt: "desc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionQueryRepo.findByNameSearch"
      );
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
                  dashboardPlayer: { userId: playerId },
                },
              },
            },
          },
        },
        include: COMPETITION_DETAILED_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionQueryRepo.findByPlayerId"
      );
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
          { dashboardId },
          {
            matches: {
              some: {
                matchPlayers: {
                  some: {
                    dashboardPlayer: { userId },
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
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prismaClient.competition.count({
          where: whereClause,
        }),
      ]);

      return { competitions, totalCount };
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionQueryRepo.findByUserWithFilters"
      );
    }
  }

  static async countByDashboardId(
    dashboardId: string,
    tx?: PrismaTransaction
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.count({
        where: { dashboardId },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionQueryRepo.countByDashboardId"
      );
    }
  }
}
