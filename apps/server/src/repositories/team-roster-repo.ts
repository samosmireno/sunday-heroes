import { PrismaTransaction } from "../types";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";
import prisma from "./prisma-client";
import { TeamRoster } from "@prisma/client";

export class TeamRosterRepo {
  static async addPlayerToTeam(
    teamId: string,
    playerId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<TeamRoster> {
    try {
      const prismaClient = tx || prisma;
      return await prisma.teamRoster.create({
        data: {
          team_id: teamId,
          dashboard_player_id: playerId,
          competition_id: competitionId,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRosterRepo.addPlayerToTeam");
    }
  }

  static async removePlayerFromTeam(
    teamId: string,
    playerId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;
      await prisma.teamRoster.delete({
        where: {
          team_id_dashboard_player_id_competition_id: {
            team_id: teamId,
            dashboard_player_id: playerId,
            competition_id: competitionId,
          },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamRosterRepo.removePlayerFromTeam"
      );
    }
  }

  static async getTeamRoster(
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ) {
    try {
      const prismaClient = tx || prisma;
      return await prisma.teamRoster.findMany({
        where: {
          team_id: teamId,
          competition_id: competitionId,
        },
        include: {
          dashboard_player: true,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRosterRepo.getTeamRoster");
    }
  }

  static async getPlayerTeamInCompetition(
    playerId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ) {
    try {
      const prismaClient = tx || prisma;
      return await prisma.teamRoster.findFirst({
        where: {
          dashboard_player_id: playerId,
          competition_id: competitionId,
        },
        include: {
          team: true,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamRosterRepo.getPlayerTeamInCompetition"
      );
    }
  }

  static async getTeamPlayerCount(
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prisma.teamRoster.count({
        where: {
          team_id: teamId,
          competition_id: competitionId,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "TeamRosterRepo.getTeamPlayerCount"
      );
    }
  }

  static async isPlayerOnTeam(
    playerId: string,
    teamId: string,
    competitionId: string,
    tx?: PrismaTransaction
  ): Promise<boolean> {
    try {
      const prismaClient = tx || prisma;
      const roster = await prisma.teamRoster.findUnique({
        where: {
          team_id_dashboard_player_id_competition_id: {
            team_id: teamId,
            dashboard_player_id: playerId,
            competition_id: competitionId,
          },
        },
      });
      return !!roster;
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "TeamRosterRepo.isPlayerOnTeam");
    }
  }
}
