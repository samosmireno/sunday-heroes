import { MatchPlayer, Prisma, Team } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";
import { MatchPlayerWithDetails, MatchPlayerWithUserDetails } from "./types";

export class MatchPlayerRepo {
  static async getAllMatchPlayers(
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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

  static async deleteMatchPlayersByIds(
    ids: string[],
    tx?: Prisma.TransactionClient
  ) {
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
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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
