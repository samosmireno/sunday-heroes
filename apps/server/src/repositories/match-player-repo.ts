import { MatchPlayer, Prisma, Team } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";

export type MatchPlayerWithDetails = Prisma.MatchPlayerGetPayload<{
  include: {
    dashboardPlayer: true;
  };
}>;

export type MatchPlayerWithUserDetails = Prisma.MatchPlayerGetPayload<{
  include: {
    dashboardPlayer: {
      include: {
        user: true;
      };
    };
  };
}>;

export class MatchPlayerRepo {
  static async getAllMatchPlayers(
    tx?: PrismaTransaction
  ): Promise<MatchPlayerWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchPlayer.findMany({
        include: {
          dashboardPlayer: true,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchPlayerRepo.getAllMatchPlayers"
      );
    }
  }

  static async getMatchPlayerById(
    id: string,
    tx?: PrismaTransaction
  ): Promise<MatchPlayerWithDetails | null> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchPlayer.findUnique({
        where: { id },
        include: {
          dashboardPlayer: true,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchPlayerRepo.getMatchPlayerById"
      );
    }
  }

  static async getMatchPlayersFromMatch(
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<MatchPlayerWithUserDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchPlayer.findMany({
        where: { matchId },
        include: {
          dashboardPlayer: {
            include: { user: true },
          },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchPlayerRepo.getMatchPlayersFromMatch"
      );
    }
  }

  static async createMatchPlayer(
    matchPlayer: Omit<MatchPlayer, "id">,
    tx?: PrismaTransaction
  ): Promise<MatchPlayer> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchPlayer.create({
        data: matchPlayer,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchPlayerRepo.createMatchPlayer"
      );
    }
  }

  static async createMatchPlayers(
    matchPlayers: Omit<MatchPlayer, "id">[],
    tx?: PrismaTransaction
  ): Promise<{ count: number }> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchPlayer.createMany({
        data: matchPlayers,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchPlayerRepo.createMatchPlayers"
      );
    }
  }

  static async updateMatchPlayer(
    id: string,
    data: Partial<MatchPlayer>,
    tx?: PrismaTransaction
  ): Promise<MatchPlayer> {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchPlayer.update({ where: { id }, data });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchPlayerRepo.updateMatchPlayer"
      );
    }
  }

  static async updateMatchPlayersStats(
    updates: Array<{ id: string; updates: Partial<any> }>,
    tx?: PrismaTransaction
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;

      await Promise.all(
        updates.map(({ id, updates: data }) =>
          prismaClient.matchPlayer.update({
            where: { id },
            data,
          })
        )
      );
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchPlayerRepo.updateMatchPlayersStats"
      );
    }
  }

  static async deleteMatchPlayer(
    id: string,
    tx?: PrismaTransaction
  ): Promise<MatchPlayer> {
    try {
      const prismaClient = tx || prisma;
      return prisma.matchPlayer.delete({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchPlayerRepo.deleteMatchPlayer"
      );
    }
  }

  static async deleteMatchPlayersByIds(ids: string[], tx?: PrismaTransaction) {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchPlayer.deleteMany({
        where: { id: { in: ids } },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchPlayerRepo.deleteMatchPlayersByIds"
      );
    }
  }

  static async deleteMatchPlayersFromMatch(
    matchId: string,
    tx?: PrismaTransaction
  ) {
    try {
      const prismaClient = tx || prisma;
      return prismaClient.matchPlayer.deleteMany({ where: { matchId } });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchPlayerRepo.deleteMatchPlayersFromMatch"
      );
    }
  }

  static async isPlayerInMatch(
    playerId: string,
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<boolean> {
    try {
      const prismaClient = tx || prisma;
      const player = await prismaClient.matchPlayer.findFirst({
        where: {
          matchId,
          dashboardPlayerId: playerId,
        },
      });
      return player !== null;
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchPlayerRepo.isPlayerInMatch");
    }
  }
}
