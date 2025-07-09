import { Competition, Prisma } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaTransaction } from "../../types";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";

const COMPETITION_BASIC_INCLUDE = {
  matches: true,
  team_competitions: true,
} satisfies Prisma.CompetitionInclude;

export const COMPETITION_DETAILED_INCLUDE = {
  dashboard: {
    select: {
      id: true,
      admin_id: true,
    },
  },
  moderators: {
    select: {
      id: true,
      dashboard_player: {
        select: {
          nickname: true,
          id: true,
          user_id: true,
        },
      },
    },
  },
  team_competitions: {
    include: {
      team: true,
    },
  },
  matches: {
    include: {
      matchPlayers: {
        include: {
          dashboard_player: true,
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
    tx?: PrismaTransaction
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
    tx?: PrismaTransaction
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

  static async findAll(tx?: PrismaTransaction): Promise<Competition[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.findMany({
        orderBy: { created_at: "desc" },
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
    tx?: PrismaTransaction
  ): Promise<CompetitionWithMatches[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.findMany({
        where: {
          dashboard_id: dashboardId,
          voting_enabled: options?.votingEnabled,
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

  static async create(
    data: Omit<Competition, "id">,
    tx?: PrismaTransaction
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
    tx?: PrismaTransaction
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
    tx?: PrismaTransaction
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
    tx?: PrismaTransaction
  ): Promise<CompetitionWithDetails> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.update({
        where: { id },
        data: {
          matches: { deleteMany: {} },
          team_competitions: { deleteMany: {} },
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
}
