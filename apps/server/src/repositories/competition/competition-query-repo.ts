import { Competition, CompetitionType, Prisma } from "@prisma/client";
import prisma from "../prisma-client";
import {
  CompetitionWithDetails,
  COMPETITION_DETAILED_INCLUDE,
} from "./competition-repo";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";

const COMPETITION_LIST_SELECT = {
  id: true,
  name: true,
  type: true,
  votingEnabled: true,
  dashboardId: true,
} satisfies Prisma.CompetitionSelect;

export type CompetitionListSelect = Prisma.CompetitionGetPayload<{
  select: typeof COMPETITION_LIST_SELECT;
}>;

export class CompetitionQueryRepo {
  static async findByType(
    type: CompetitionType,
    options?: { limit?: number; offset?: number },
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
  ): Promise<{ competitions: CompetitionListSelect[]; totalCount: number }> {
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
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
          select: COMPETITION_LIST_SELECT,
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

  static async getAggregates(competitionIds: string[]) {
    if (competitionIds.length === 0) {
      return {
        matchCounts: {},
        teamCounts: {},
        playerCounts: {},
      };
    }

    const [matchCountsRaw, teamCountsRaw, distinctPlayers] = await Promise.all([
      prisma.match.groupBy({
        by: ["competitionId"],
        where: { competitionId: { in: competitionIds } },
        _count: { competitionId: true },
      }),

      prisma.teamCompetition.groupBy({
        by: ["competitionId"],
        where: { competitionId: { in: competitionIds } },
        _count: { competitionId: true },
      }),

      prisma.matchPlayer.findMany({
        where: {
          match: {
            competitionId: { in: competitionIds },
          },
        },
        select: {
          match: {
            select: {
              competitionId: true,
            },
          },
          dashboardPlayerId: true,
        },
        distinct: ["dashboardPlayerId"],
      }),
    ]);

    const matchCounts = Object.fromEntries(
      matchCountsRaw.map((m) => [m.competitionId, m._count.competitionId])
    );

    const teamCounts = Object.fromEntries(
      teamCountsRaw.map((t) => [t.competitionId, t._count.competitionId])
    );

    const playerCounts: Record<string, number> = {};
    for (const p of distinctPlayers) {
      playerCounts[p.match.competitionId] =
        (playerCounts[p.match.competitionId] ?? 0) + 1;
    }

    return {
      matchCounts,
      teamCounts,
      playerCounts,
    };
  }

  static async countByDashboardId(
    dashboardId: string,
    tx?: Prisma.TransactionClient
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
