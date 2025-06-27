import prisma from "./prisma-client";
import { Prisma, TeamCompetition } from "@prisma/client";
import { PrismaTransaction } from "../types";

export type TeamCompetitionWithDetails = Prisma.TeamCompetitionGetPayload<{
  include: {
    team: true;
  };
}>;

export class TeamCompetitionRepo {
  static async getTeamsFromCompetitionId(
    competition_id: string
  ): Promise<string[]> {
    const teams = await prisma.teamCompetition.findMany({
      where: { competition_id },
      select: {
        team: {
          select: {
            name: true,
          },
        },
      },
    });
    return teams.map((tc) => tc.team.name);
  }

  static async getTeamCompetitionStats(
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<TeamCompetition | null> {
    const prismaClient = tx || prisma;
    return await prismaClient.teamCompetition.findUnique({
      where: {
        team_id_competition_id: {
          team_id: teamId,
          competition_id: competitionId,
        },
      },
    });
  }

  static async incrementTeamStats(
    teamId: string,
    competitionId: string,
    updates: {
      points?: number;
      wins?: number;
      draws?: number;
      losses?: number;
      goals_for?: number;
      goals_against?: number;
    },
    tx?: PrismaTransaction
  ): Promise<TeamCompetition> {
    const prismaClient = tx || prisma;

    const current = await this.getTeamCompetitionStats(
      teamId,
      competitionId,
      tx
    );
    if (!current) {
      throw new Error("Team competition record not found");
    }

    return await prismaClient.teamCompetition.update({
      where: {
        team_id_competition_id: {
          team_id: teamId,
          competition_id: competitionId,
        },
      },
      data: {
        points: current.points + (updates.points || 0),
        wins: current.wins + (updates.wins || 0),
        draws: current.draws + (updates.draws || 0),
        losses: current.losses + (updates.losses || 0),
        goals_for: current.goals_for + (updates.goals_for || 0),
        goals_against: current.goals_against + (updates.goals_against || 0),
      },
    });
  }

  static async resetTeamStats(
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<TeamCompetition> {
    const prismaClient = tx || prisma;
    return await prismaClient.teamCompetition.update({
      where: {
        team_id_competition_id: {
          team_id: teamId,
          competition_id: competitionId,
        },
      },
      data: {
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
      },
    });
  }

  static async getAllTeamsInCompetition(
    competitionId: string,
    tx?: PrismaTransaction
  ) {
    const prismaClient = tx || prisma;
    return await prismaClient.teamCompetition.findMany({
      where: { competition_id: competitionId },
      include: {
        team: {
          include: {
            team_rosters: {
              where: { competition_id: competitionId },
              include: {
                dashboard_player: true,
              },
            },
          },
        },
      },
    });
  }

  static async getTeamCompetitionsForLeague(
    competitionId: string,
    tx?: PrismaTransaction
  ) {
    const prismaClient = tx || prisma;
    return await prismaClient.teamCompetition.findMany({
      where: { competition_id: competitionId },
      include: {
        team: true,
      },
    });
  }

  static async createTeamCompetition(
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<TeamCompetition> {
    const prismaClient = tx || prisma;
    return await prismaClient.teamCompetition.create({
      data: {
        team_id: teamId,
        competition_id: competitionId,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
      },
    });
  }

  static async deleteTeamFromCompetition(
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    const prismaClient = tx || prisma;
    await prismaClient.teamCompetition.delete({
      where: {
        team_id_competition_id: {
          team_id: teamId,
          competition_id: competitionId,
        },
      },
    });
  }

  static async addTeamToCompetition(
    teamId: string,
    competitionId: string
  ): Promise<TeamCompetition> {
    try {
      return await prisma.teamCompetition.create({
        data: {
          team_id: teamId,
          competition_id: competitionId,
          points: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goals_for: 0,
          goals_against: 0,
        },
      });
    } catch (error) {
      console.error("Error in TeamRepo.addTeamToCompetition:", error);
      throw new Error("Failed to add team to competition");
    }
  }

  static async bulkResetStats(
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    const prismaClient = tx || prisma;
    await prismaClient.teamCompetition.updateMany({
      where: { competition_id: competitionId },
      data: {
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
      },
    });
  }

  static async findByTeamAndCompetition(
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<TeamCompetition | null> {
    const prismaClient = tx || prisma;
    return await prismaClient.teamCompetition.findUnique({
      where: {
        team_id_competition_id: {
          team_id: teamId,
          competition_id: competitionId,
        },
      },
      include: {
        team: true,
      },
    });
  }

  static async updateTeamId(
    oldTeamId: string,
    newTeamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    const prismaClient = tx || prisma;
    await prismaClient.teamCompetition.update({
      where: {
        team_id_competition_id: {
          team_id: oldTeamId,
          competition_id: competitionId,
        },
      },
      data: {
        team_id: newTeamId,
      },
    });
  }
}
