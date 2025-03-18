import { DashboardPlayer } from "@prisma/client";
import prisma from "./prisma-client";

export class DashboardPlayerRepo {
  static async getAllDashboardPlayers(): Promise<DashboardPlayer[]> {
    return prisma.dashboardPlayer.findMany();
  }

  static async getDashboardPlayerById(
    id: string
  ): Promise<DashboardPlayer | null> {
    return prisma.dashboardPlayer.findUnique({ where: { id } });
  }

  static async getDashboardPlayerByNickname(
    nickname: string,
    dashboard_id: string
  ): Promise<DashboardPlayer | null> {
    return prisma.dashboardPlayer.findUnique({
      where: { dashboard_id_nickname: { dashboard_id, nickname } },
    });
  }

  static async getDashboardPlayerIdByNickname(
    nickname: string,
    dashboard_id: string
  ): Promise<string | null> {
    const dashboardPlayer = await prisma.dashboardPlayer.findUnique({
      where: { dashboard_id_nickname: { dashboard_id, nickname } },
    });
    return dashboardPlayer ? dashboardPlayer.id : null;
  }

  static async getDashboardPlayersByQuery(
    query: string,
    dashboard_id: string
  ): Promise<DashboardPlayer[]> {
    return prisma.dashboardPlayer.findMany({
      where: {
        dashboard_id,
        nickname: {
          startsWith: query,
          mode: "insensitive",
        },
      },
    });
  }

  static async getModerators(dashboard_id: string): Promise<DashboardPlayer[]> {
    return prisma.dashboardPlayer.findMany({
      where: { dashboard_id },
      include: { user: { where: { role: "MODERATOR" } } },
    });
  }

  static async createUser(
    data: Omit<DashboardPlayer, "id">
  ): Promise<DashboardPlayer> {
    return prisma.dashboardPlayer.create({ data });
  }

  static async updateUser(
    id: string,
    data: Partial<DashboardPlayer>
  ): Promise<DashboardPlayer> {
    return prisma.dashboardPlayer.update({ where: { id }, data });
  }

  static async addMissingUsers(
    playerNames: string[],
    dashboard_id: string
  ): Promise<void> {
    for (const playerName of playerNames) {
      const existingPlayer = await prisma.dashboardPlayer.findFirst({
        where: {
          dashboard_id,
          nickname: { equals: playerName, mode: "insensitive" },
        },
      });

      if (!existingPlayer) {
        await prisma.dashboardPlayer.create({
          data: { nickname: playerName, dashboard_id },
        });
      }
    }
  }

  static async deleteUser(id: string): Promise<DashboardPlayer> {
    return prisma.dashboardPlayer.delete({ where: { id } });
  }

  static async deleteDashboardPlayersWithNoMatches(): Promise<void> {
    await prisma.dashboardPlayer.deleteMany({
      where: {
        match_players: {
          none: {},
        },
      },
    });
  }
}
