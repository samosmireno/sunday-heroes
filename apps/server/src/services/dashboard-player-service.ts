import {
  DashboardPlayerRepo,
  DashboardPlayerWithDetails,
} from "../repositories/dashboard-player-repo";
import { DashboardService } from "./dashboard-service";
import { transformDashboardPlayersToResponse } from "../utils/players-transforms";
import prisma from "../repositories/prisma-client";

export class DashboardPlayerService {
  static async getDashboardPlayers(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ) {
    const dashboardId = await DashboardService.getDashboardIdFromUserId(userId);
    const { page = 0, limit = 10, search } = options;
    const offset = page * limit;

    let players: DashboardPlayerWithDetails[];
    let totalCount: number;
    if (search) {
      [players, totalCount] = await Promise.all([
        DashboardPlayerRepo.findByNameSearch(search, dashboardId, {
          limit,
          offset,
        }),
        DashboardPlayerRepo.countByNameSearch(search, dashboardId),
      ]);
    } else {
      [players, totalCount] = await Promise.all([
        DashboardPlayerRepo.findByDashboardId(dashboardId, { limit, offset }),
        DashboardPlayerRepo.countByDashboardId(dashboardId),
      ]);
    }
    return {
      players: transformDashboardPlayersToResponse(players),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  static async getDashboardPlayersByQuery(userId: string, query: string) {
    const dashboardId = await DashboardService.getDashboardIdFromUserId(userId);
    return await DashboardPlayerRepo.findByNameSearch(query, dashboardId);
  }

  static async createDashboardPlayer(
    userId: string,
    data: { nickname: string }
  ) {
    const dashboardId = await DashboardService.getDashboardIdFromUserId(userId);

    const canCreate = await DashboardService.canUserAccessDashboard(
      dashboardId,
      userId
    );
    if (!canCreate) {
      throw new Error("Only dashboard admin can create players");
    }

    const existingPlayer = await DashboardPlayerRepo.findByNickname(
      data.nickname,
      dashboardId
    );
    if (existingPlayer) {
      throw new Error("Player with this nickname already exists");
    }

    return await DashboardPlayerRepo.create({
      user_id: userId,
      nickname: data.nickname,
      dashboard_id: dashboardId,
      created_at: new Date(),
    });
  }

  static async updateDashboardPlayer(
    playerId: string,
    userId: string,
    data: { nickname?: string; user_id?: string }
  ) {
    const player = await DashboardPlayerRepo.findByIdWithAdmin(playerId);
    if (!player) {
      throw new Error("Dashboard player not found");
    }

    const isAdmin = player.dashboard.admin_id === userId;
    if (!isAdmin) {
      throw new Error("Only dashboard admin can update players");
    }

    if (data.nickname && data.nickname !== player.nickname) {
      const existingPlayer = await DashboardPlayerRepo.findByNickname(
        data.nickname,
        player.dashboard_id
      );
      if (existingPlayer) {
        throw new Error("Player with this nickname already exists");
      }
    }

    return await DashboardPlayerRepo.update(playerId, data);
  }

  static async deleteDashboardPlayer(playerId: string, userId: string) {
    const player = await DashboardPlayerRepo.findByIdWithAdmin(playerId);
    if (!player) {
      throw new Error("Dashboard player not found");
    }

    const isAdmin = player.dashboard.admin_id === userId;
    if (!isAdmin) {
      throw new Error("Only dashboard admin can delete players");
    }

    return await DashboardPlayerRepo.delete(playerId);
  }

  static async addMissingPlayers(
    playerNames: string[],
    dashboardId: string,
    tx?: any
  ): Promise<void> {
    for (const playerName of playerNames) {
      const existingPlayer = await DashboardPlayerRepo.findByNickname(
        playerName,
        dashboardId,
        tx
      );

      if (!existingPlayer) {
        await DashboardPlayerRepo.create(
          {
            user_id: null,
            nickname: playerName,
            dashboard_id: dashboardId,
            created_at: new Date(),
          },
          tx
        );
      }
    }
  }

  static async getPlayersByNicknames(
    nicknames: string[],
    dashboardId: string,
    tx?: any
  ) {
    return await DashboardPlayerRepo.findByNicknames(
      nicknames,
      dashboardId,
      tx
    );
  }

  static async cleanupUnusedPlayers(tx?: any): Promise<void> {
    return await prisma.$transaction(async (transaction) => {
      const unusedPlayers = await transaction.dashboardPlayer.findMany({
        where: {
          match_players: { none: {} },
          user_id: null,
        },
        select: { id: true },
      });

      if (unusedPlayers.length > 0) {
        const ids = unusedPlayers.map((p) => p.id);
        await DashboardPlayerRepo.deleteMany(ids, transaction);
        console.log(
          `Cleaned up ${unusedPlayers.length} unused dashboard players`
        );
      }
    });
  }

  static async getPlayerInDashboard(dashboardId: string, userId: string) {
    return await DashboardPlayerRepo.findByUserId(userId, dashboardId);
  }

  static async linkUserToPlayer(playerId: string, userId: string) {
    const player = await DashboardPlayerRepo.findById(playerId);
    if (!player) {
      throw new Error("Dashboard player not found");
    }

    if (player.user_id) {
      throw new Error("Player already has a user linked");
    }

    return await DashboardPlayerRepo.update(playerId, { user_id: userId });
  }

  static async getModerators(userId: string) {
    const dashboardId = await DashboardService.getDashboardIdFromUserId(userId);

    return await prisma.dashboardPlayer.findMany({
      where: {
        dashboard_id: dashboardId,
        user: { role: "MODERATOR" },
      },
      include: {
        user: {
          select: { id: true, role: true, given_name: true, family_name: true },
        },
      },
    });
  }
}
