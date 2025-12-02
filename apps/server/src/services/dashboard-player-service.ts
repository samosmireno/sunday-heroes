import { DashboardPlayerWithDetails } from "../repositories/dashboard-player/types";
import { DashboardService } from "./dashboard-service";
import { transformDashboardPlayersToResponse } from "../utils/players-transforms";
import prisma from "../repositories/prisma-client";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from "../utils/errors";
import { CompetitionService } from "./competition-service";
import { CompetitionRepo } from "../repositories/competition/competition-repo";
import { DashboardPlayerRepo } from "../repositories/dashboard-player/dashboard-player-repo";

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
        DashboardPlayerRepo.findByNameSearchWithDetails(search, dashboardId, {
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

  static async getDashboardPlayersForUser(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ) {
    const competitionIds =
      await CompetitionRepo.findCompetitionIdsForUser(userId);
    const { page = 0, limit = 10, search } = options;
    const offset = page * limit;

    const [players, totalCount] = await Promise.all([
      DashboardPlayerRepo.findInCompetitions(competitionIds, {
        search,
        limit,
        offset,
      }),
      DashboardPlayerRepo.countInCompetitions(competitionIds),
    ]);

    return {
      players: transformDashboardPlayersToResponse(players),
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  static async getDashboardPlayersByQuery(
    userId: string,
    competitionId: string,
    query: string
  ): Promise<{ id: string; nickname: string }[]> {
    const isModerator = await CompetitionService.isUserModerator(
      competitionId,
      userId
    );

    if (isModerator) {
      const dashPlayers =
        await DashboardPlayerRepo.findByNameSearchInCompetition(
          query,
          competitionId
        );

      return dashPlayers
        .filter((dp) => dp.user?.id !== undefined)
        .map((dp) => ({
          id: dp.id,
          nickname: dp.nickname,
        }));
    } else {
      const dashboardId =
        await DashboardService.getDashboardIdFromUserId(userId);

      if (!dashboardId) {
        throw new NotFoundError("Dashboard");
      }

      const dashPlayers = await DashboardPlayerRepo.findByNameSearchWithBasic(
        query,
        dashboardId
      );

      return dashPlayers
        .filter((dp) => dp.user?.id !== undefined)
        .map((dp) => ({
          id: dp.id,
          nickname: dp.nickname,
        }));
    }
  }

  static async createDashboardPlayer(
    userId: string,
    data: { nickname: string }
  ) {
    const dashboardId = await DashboardService.getDashboardIdFromUserId(userId);

    if (!dashboardId) {
      throw new NotFoundError("Dashboard");
    }

    const canCreate = await DashboardService.canUserAccessDashboard(
      dashboardId,
      userId
    );
    if (!canCreate) {
      throw new AuthorizationError(
        "User is not authorized to create players in this dashboard"
      );
    }

    const existingPlayer = await DashboardPlayerRepo.findByNickname(
      data.nickname,
      dashboardId
    );
    if (existingPlayer) {
      throw new ConflictError(
        "Player with this nickname already exists in the dashboard"
      );
    }

    return await DashboardPlayerRepo.create({
      userId,
      nickname: data.nickname,
      dashboardId,
      createdAt: new Date(),
    });
  }

  static async updateDashboardPlayer(
    playerId: string,
    userId: string,
    data: { nickname?: string; user_id?: string }
  ) {
    const player = await DashboardPlayerRepo.findByIdWithAdmin(playerId);
    if (!player) {
      throw new NotFoundError("Dashboard player");
    }

    const isAdmin = player.dashboard.adminId === userId;
    if (!isAdmin) {
      throw new AuthorizationError("Only dashboard admin can update players");
    }

    if (data.nickname && data.nickname !== player.nickname) {
      const existingPlayer = await DashboardPlayerRepo.findByNickname(
        data.nickname,
        player.dashboardId
      );
      if (existingPlayer) {
        throw new ConflictError(
          "Player with this nickname already exists in the dashboard"
        );
      }
    }

    return await DashboardPlayerRepo.update(playerId, data);
  }

  static async deleteDashboardPlayer(playerId: string, userId: string) {
    const player = await DashboardPlayerRepo.findByIdWithAdmin(playerId);
    if (!player) {
      throw new NotFoundError("Dashboard player");
    }

    const isAdmin = player.dashboard.adminId === userId;
    if (!isAdmin) {
      throw new AuthorizationError("Only dashboard admin can delete players");
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
            userId: null,
            nickname: playerName,
            dashboardId,
            createdAt: new Date(),
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
          matchPlayers: { none: {} },
          userId: null,
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
      throw new NotFoundError("Dashboard player");
    }

    if (player.userId) {
      throw new ConflictError("This player is already linked to a user");
    }

    return await DashboardPlayerRepo.update(playerId, { userId });
  }

  static async getModerators(userId: string) {
    const dashboardId = await DashboardService.getDashboardIdFromUserId(userId);

    if (!dashboardId) {
      throw new NotFoundError("Dashboard");
    }
    return await prisma.dashboardPlayer.findMany({
      where: {
        dashboardId,
        user: { role: "MODERATOR" },
      },
      include: {
        user: {
          select: { id: true, role: true, givenName: true, familyName: true },
        },
      },
    });
  }
}
