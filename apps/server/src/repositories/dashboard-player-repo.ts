import { DashboardPlayer, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";

const DASHBOARD_PLAYER_BASIC_INCLUDE = {
  user: {
    select: {
      id: true,
      email: true,
    },
  },
} satisfies Prisma.DashboardPlayerInclude;

const DASHBOARD_PLAYER_WITH_DASHBOARD_DATA = {
  dashboard: {
    include: {
      competitions: {
        include: {
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
              competition: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.DashboardPlayerInclude;

const DASHBOARD_PLAYER_DETAILED_INCLUDE = {
  user: {
    select: {
      id: true,
      email: true,
      isRegistered: true,
    },
  },
  matchPlayers: {
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
          playerVotes: true,
        },
      },
      receivedVotes: true,
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

export type DashboardPlayerWithDashboardData =
  Prisma.DashboardPlayerGetPayload<{
    include: typeof DASHBOARD_PLAYER_WITH_DASHBOARD_DATA;
  }>;

export type DashboardCompetitionsType = Prisma.DashboardPlayerGetPayload<{
  include: typeof DASHBOARD_PLAYER_WITH_DASHBOARD_DATA;
}>["dashboard"]["competitions"];

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
      throw PrismaErrorHandler.handle(error, "DashboardPlayerRepo.findById");
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
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerRepo.findByIdWithUserDetails"
      );
    }
  }

  static async findByUserIdWithDashboardData(
    userId: string,
    tx?: PrismaTransaction
  ): Promise<DashboardPlayerWithDashboardData[] | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.findMany({
        where: { userId },
        include: {
          dashboard: {
            include: {
              competitions: {
                where: {
                  matches: {
                    some: {
                      matchPlayers: {
                        some: {
                          dashboardPlayer: {
                            userId: userId,
                          },
                        },
                      },
                    },
                  },
                },
                include: {
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
                      competition: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerRepo.findByUserIdWithDashboardData"
      );
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
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerRepo.findByIdWithAdmin"
      );
    }
  }

  static async findAll(tx?: PrismaTransaction): Promise<DashboardPlayer[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.findMany({
        orderBy: { nickname: "asc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "DashboardPlayerRepo.findAll");
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
        where: { dashboardId },
        include: DASHBOARD_PLAYER_DETAILED_INCLUDE,
        orderBy: { nickname: "asc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerRepo.findByDashboardId"
      );
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
          dashboardId_nickname: {
            dashboardId,
            nickname,
          },
        },
        include: DASHBOARD_PLAYER_BASIC_INCLUDE,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerRepo.findByNickname"
      );
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
          dashboardId,
          nickname: { in: nicknames },
        },
        include: DASHBOARD_PLAYER_BASIC_INCLUDE,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerRepo.findByNicknames"
      );
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
          dashboardId,
          userId,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerRepo.findByUserId"
      );
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
          dashboardId,
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
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerRepo.findByNameSearch"
      );
    }
  }

  static async findByNameSearchInCompetition(
    searchTerm: string,
    competitionId: string,
    options?: { limit?: number; offset?: number },
    tx?: PrismaTransaction
  ): Promise<DashboardPlayerWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      const DashboardPlayers = await prismaClient.dashboardPlayer.findMany({
        where: {
          matchPlayers: {
            some: {
              match: {
                competitionId: competitionId,
              },
            },
          },
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
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerRepo.findByNameSearchInCompetition"
      );
    }
  }

  static async countByDashboardId(
    dashboardId: string,
    tx?: PrismaTransaction
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardPlayer.count({
        where: { dashboardId },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerRepo.countByDashboardId"
      );
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
          dashboardId,
          nickname: {
            startsWith: searchTerm,
            mode: "insensitive",
          },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerRepo.countByNameSearch"
      );
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
      throw PrismaErrorHandler.handle(error, "DashboardPlayerRepo.create");
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
      throw PrismaErrorHandler.handle(error, "DashboardPlayerRepo.createMany");
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
      throw PrismaErrorHandler.handle(error, "DashboardPlayerRepo.update");
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
      throw PrismaErrorHandler.handle(error, "DashboardPlayerRepo.delete");
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
      throw PrismaErrorHandler.handle(error, "DashboardPlayerRepo.deleteMany");
    }
  }
}
