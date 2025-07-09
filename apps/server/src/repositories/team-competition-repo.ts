import prisma from "./prisma-client";
import { Prisma, TeamCompetition } from "@prisma/client";
import { PrismaTransaction } from "../types";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";

export type TeamCompetitionWithDetails = Prisma.TeamCompetitionGetPayload<{
  include: {
    team: true;
  };
}>;

export class TeamCompetitionRepo {
  static async getTeamsFromCompetitionId(
    competition_id: string,
    tx?: PrismaTransaction
  ): Promise<string[]> {
    try {
      const prismaClient = tx || prisma;
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
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.getTeamsFromCompetitionId"
      );
    }
  }

  static async getTeamCompetitionStats(
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<TeamCompetition | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.teamCompetition.findUnique({
        where: {
          team_id_competition_id: {
            team_id: teamId,
            competition_id: competitionId,
          },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.getTeamCompetitionStats"
      );
    }
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
    try {
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
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.incrementTeamStats"
      );
    }
  }

  static async resetTeamStats(
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<TeamCompetition> {
    try {
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
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.resetTeamStats"
      );
    }
  }

  static async getAllTeamsInCompetition(
    competitionId: string,
    tx?: PrismaTransaction
  ) {
    try {
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
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.getAllTeamsInCompetition"
      );
    }
  }

  static async getTeamCompetitionsForLeague(
    competitionId: string,
    tx?: PrismaTransaction
  ) {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.teamCompetition.findMany({
        where: { competition_id: competitionId },
        include: {
          team: true,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.getTeamCompetitionsForLeague"
      );
    }
  }

  static async createTeamCompetition(
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<TeamCompetition> {
    try {
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
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.createTeamCompetition"
      );
    }
  }

  static async deleteTeamFromCompetition(
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;
      await prismaClient.teamCompetition.delete({
        where: {
          team_id_competition_id: {
            team_id: teamId,
            competition_id: competitionId,
          },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.deleteTeamFromCompetition"
      );
    }
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
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.addTeamToCompetition"
      );
    }
  }

  static async bulkResetStats(
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    try {
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
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.bulkResetStats"
      );
    }
  }

  static async findByTeamAndCompetition(
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<TeamCompetition | null> {
    try {
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
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.findByTeamAndCompetition"
      );
    }
  }

  static async updateTeamId(
    oldTeamId: string,
    newTeamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    try {
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
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamCompetitionRepo.updateTeamId"
      );
    }
  }
}
