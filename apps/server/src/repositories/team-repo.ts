import { Team, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";

const TEAM_WITH_COMPETITIONS_INCLUDE = {
  team_competitions: true,
  team_rosters: {
    include: {
      dashboard_player: true,
    },
  },
} satisfies Prisma.TeamInclude;

const TEAM_IN_COMPETITION_INCLUDE = {
  team_competitions: {
    include: {
      competition: true,
    },
  },
  team_rosters: {
    include: {
      dashboard_player: true,
    },
  },
} satisfies Prisma.TeamInclude;

export type TeamWithCompetitions = Prisma.TeamGetPayload<{
  include: typeof TEAM_WITH_COMPETITIONS_INCLUDE;
}>;

export type TeamInCompetition = Prisma.TeamGetPayload<{
  include: typeof TEAM_IN_COMPETITION_INCLUDE;
}>;

export class TeamRepo {
  static async findById(
    id: string,
    tx?: PrismaTransaction
  ): Promise<Team | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.team.findUnique({ where: { id } });
    } catch (error) {
      console.error("Error in TeamRepo.findById:", error);
      throw new Error("Failed to fetch team");
    }
  }

  static async findByName(
    name: string,
    competition_id: string,
    tx?: PrismaTransaction
  ): Promise<Team | null> {
    try {
      const prismaClient = tx || prisma;
      const team = await prismaClient.team.findFirst({
        where: {
          name,
          team_competitions: {
            some: { competition_id },
          },
        },
      });

      return team;
    } catch (error) {
      console.error("Error in TeamRepo.findByName:", error);
      throw new Error("Failed to fetch team by name");
    }
  }

  static async findAll(tx?: PrismaTransaction): Promise<Team[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.team.findMany({
        orderBy: { name: "asc" },
      });
    } catch (error) {
      console.error("Error in TeamRepo.findAll:", error);
      throw new Error("Failed to fetch teams");
    }
  }

  static async findByCompetitionId(
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<TeamInCompetition[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.team.findMany({
        where: {
          team_competitions: {
            some: { competition_id: competitionId },
          },
        },
        include: {
          team_competitions: {
            where: { competition_id: competitionId },
            include: {
              competition: true,
            },
          },
          team_rosters: {
            where: { competition_id: competitionId },
            include: {
              dashboard_player: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });
    } catch (error) {
      console.error("Error in TeamRepo.findByCompetitionId:", error);
      throw new Error("Failed to fetch teams by competition");
    }
  }

  static async create(
    data: Omit<Team, "id">,
    tx?: PrismaTransaction
  ): Promise<Team> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.team.create({ data });
    } catch (error) {
      console.error("Error in TeamRepo.create:", error);
      throw new Error("Failed to create team");
    }
  }

  static async update(
    id: string,
    data: Partial<Team>,
    tx?: PrismaTransaction
  ): Promise<Team> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.team.update({ where: { id }, data });
    } catch (error) {
      console.error("Error in TeamRepo.update:", error);
      throw new Error("Failed to update team");
    }
  }

  static async delete(id: string, tx?: PrismaTransaction): Promise<Team> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.team.delete({ where: { id } });
    } catch (error) {
      console.error("Error in TeamRepo.delete:", error);
      throw new Error("Failed to delete team");
    }
  }

  static async deleteMany(
    ids: string[],
    tx?: PrismaTransaction
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;
      await prismaClient.team.deleteMany({
        where: {
          id: { in: ids },
        },
      });
    } catch (error) {
      console.error("Error in TeamRepo.deleteMany:", error);
      throw new Error("Failed to delete teams");
    }
  }

  static async checkNameUnique(
    name: string,
    excludeId?: string,
    tx?: PrismaTransaction
  ): Promise<boolean> {
    try {
      const prismaClient = tx || prisma;
      const existing = await prismaClient.team.findFirst({
        where: {
          name,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });
      return !existing;
    } catch (error) {
      console.error("Error in TeamRepo.checkNameUnique:", error);
      throw new Error("Failed to check team name uniqueness");
    }
  }

  static async checkNameUniqueInCompetition(
    name: string,
    competitionId: string,
    excludeTeamId?: string,
    tx?: PrismaTransaction
  ): Promise<boolean> {
    try {
      const prismaClient = tx || prisma;
      const existing = await prismaClient.team.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: "insensitive",
          },
          team_competitions: {
            some: {
              competition_id: competitionId,
            },
          },
          ...(excludeTeamId && {
            id: {
              not: excludeTeamId,
            },
          }),
        },
      });
      return !existing;
    } catch (error) {
      console.error("Error in TeamRepo.checkNameUniqueInCompetition:", error);
      throw new Error("Failed to check team name uniqueness");
    }
  }

  static async getTeamIDFromName(
    team_name: string,
    competition_id: string
  ): Promise<string> {
    try {
      const team = await this.findByName(team_name, competition_id);
      if (!team) {
        throw new Error(`Team with name ${team_name} not found`);
      }
      return team.id;
    } catch (error) {
      console.error("Error in TeamRepo.getTeamIDFromName:", error);
      throw error;
    }
  }

  static async findByNameInDashboard(
    name: string,
    dashboardId: string,
    tx?: PrismaTransaction
  ): Promise<Team | null> {
    const prismaClient = tx || prisma;
    return await prismaClient.team.findFirst({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
        team_competitions: {
          some: {
            competition: { dashboard_id: dashboardId },
          },
        },
      },
    });
  }
}
