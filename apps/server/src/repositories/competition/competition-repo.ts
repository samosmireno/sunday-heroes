import { Competition, Prisma } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaTransaction } from "../../types";

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
  team_competitions: true,
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
      console.error("Error in CompetitionRepo.findById:", error);
      throw new Error("Failed to fetch competition");
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
      console.error("Error in CompetitionRepo.findByIdWithDetails:", error);
      throw new Error("Failed to fetch competition with details");
    }
  }

  static async findAll(tx?: PrismaTransaction): Promise<Competition[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.findMany({
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error in CompetitionRepo.findAll:", error);
      throw new Error("Failed to fetch competitions");
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
      console.error("Error in CompetitionRepo.findByDashboardId:", error);
      throw new Error("Failed to fetch competitions by dashboard");
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
      console.error("Error in CompetitionRepo.create:", error);
      throw new Error("Failed to create competition");
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
      console.error("Error in CompetitionRepo.update:", error);
      throw new Error("Failed to update competition");
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
      console.error("Error in CompetitionRepo.delete:", error);
      throw new Error("Failed to delete competition");
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
      console.error("Error in CompetitionRepo.resetCompetition:", error);
      throw new Error("Failed to reset competition");
    }
  }
}
