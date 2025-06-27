import prisma from "./prisma-client";
import { TeamRoster } from "@prisma/client";

export class TeamRosterRepo {
  static async addPlayerToTeam(
    teamId: string,
    playerId: string,
    competitionId: string
  ): Promise<TeamRoster> {
    return await prisma.teamRoster.create({
      data: {
        team_id: teamId,
        dashboard_player_id: playerId,
        competition_id: competitionId,
      },
    });
  }

  static async removePlayerFromTeam(
    teamId: string,
    playerId: string,
    competitionId: string
  ): Promise<void> {
    await prisma.teamRoster.delete({
      where: {
        team_id_dashboard_player_id_competition_id: {
          team_id: teamId,
          dashboard_player_id: playerId,
          competition_id: competitionId,
        },
      },
    });
  }

  static async getTeamRoster(teamId: string, competitionId: string) {
    return await prisma.teamRoster.findMany({
      where: {
        team_id: teamId,
        competition_id: competitionId,
      },
      include: {
        dashboard_player: true,
      },
    });
  }

  static async getPlayerTeamInCompetition(
    playerId: string,
    competitionId: string
  ) {
    return await prisma.teamRoster.findFirst({
      where: {
        dashboard_player_id: playerId,
        competition_id: competitionId,
      },
      include: {
        team: true,
      },
    });
  }

  static async getTeamPlayerCount(
    teamId: string,
    competitionId: string
  ): Promise<number> {
    return await prisma.teamRoster.count({
      where: {
        team_id: teamId,
        competition_id: competitionId,
      },
    });
  }

  static async isPlayerOnTeam(
    playerId: string,
    teamId: string,
    competitionId: string
  ): Promise<boolean> {
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
  }
}
