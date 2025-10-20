import { Competition, Prisma } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";

const COMPETITION_BASIC_INCLUDE = {
  matches: true,
  teamCompetitions: true,
} satisfies Prisma.CompetitionInclude;

export const COMPETITION_DETAILED_INCLUDE = {
  dashboard: {
    select: {
      id: true,
      adminId: true,
    },
  },
  moderators: {
    select: {
      id: true,
      dashboardPlayer: {
        select: {
          nickname: true,
          id: true,
          userId: true,
        },
      },
    },
  },
  teamCompetitions: {
    include: {
      team: true,
    },
  },
  matches: {
    include: {
      matchPlayers: {
        include: {
          dashboardPlayer: true,
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
    orderBy: {
      date: "desc",
    },
  },
} satisfies Prisma.CompetitionInclude;

export type CompetitionWithMatches = Prisma.CompetitionGetPayload<{
  include: typeof COMPETITION_BASIC_INCLUDE;
}>;

export type CompetitionWithDetails = Prisma.CompetitionGetPayload<{
  include: typeof COMPETITION_DETAILED_INCLUDE;
}>;

export class CompetitionRepo {
  static async findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<Competition | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.findUnique({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "CompetitionRepo.findById");
    }
  }

  static async findByIdWithDetails(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<CompetitionWithDetails | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.findUnique({
        where: { id },
        include: COMPETITION_DETAILED_INCLUDE,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionRepo.findByIdWithDetails"
      );
    }
  }

  static async findAll(tx?: Prisma.TransactionClient): Promise<Competition[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "CompetitionRepo.findAll");
    }
  }

  static async findByDashboardId(
    dashboardId: string,
    options?: {
      votingEnabled?: boolean;
    },
    tx?: Prisma.TransactionClient
  ): Promise<CompetitionWithMatches[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.findMany({
        where: {
          dashboardId,
          votingEnabled: options?.votingEnabled,
        },
        include: COMPETITION_BASIC_INCLUDE,
        orderBy: { matches: { _count: "desc" } },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionRepo.findByDashboardId"
      );
    }
  }

  static async findByMatchId(
    matchId: string,
    tx?: Prisma.TransactionClient
  ): Promise<CompetitionWithDetails | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.findFirst({
        where: {
          matches: {
            some: {
              id: matchId,
            },
          },
        },
        include: COMPETITION_DETAILED_INCLUDE,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "CompetitionRepo.findByMatchId");
    }
  }

  static async findCompetitionIdsForUser(
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<string[]> {
    try {
      const prismaClient = tx || prisma;
      const competitions = await prismaClient.competition.findMany({
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
        select: {
          id: true,
        },
      });

      return competitions.map((comp) => comp.id);
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionRepo.findCompetitionIdsForUser"
      );
    }
  }

  static async create(
    data: Omit<Competition, "id">,
    tx?: Prisma.TransactionClient
  ): Promise<Competition> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.create({ data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "CompetitionRepo.create");
    }
  }

  static async update(
    id: string,
    data: Partial<Competition>,
    tx?: Prisma.TransactionClient
  ): Promise<Competition> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.update({ where: { id }, data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "CompetitionRepo.update");
    }
  }

  static async delete(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<Competition> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.delete({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "CompetitionRepo.delete");
    }
  }

  static async resetCompetition(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<CompetitionWithDetails> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.update({
        where: { id },
        data: {
          matches: { deleteMany: {} },
          teamCompetitions: { deleteMany: {} },
        },
        include: COMPETITION_DETAILED_INCLUDE,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionRepo.resetCompetition"
      );
    }
  }

  static async resetCompetitionWithoutTeams(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<CompetitionWithDetails> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.update({
        where: { id },
        data: {
          matches: { deleteMany: {} },
        },
        include: COMPETITION_DETAILED_INCLUDE,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionRepo.resetCompetitionWithoutTeam"
      );
    }
  }
}
