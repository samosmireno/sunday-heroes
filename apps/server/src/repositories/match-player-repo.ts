import { MatchPlayer, Prisma, Team } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";

export type MatchPlayerWithDetails = Prisma.MatchPlayerGetPayload<{
  include: {
    dashboard_player: true;
  };
}>;

export type MatchPlayerWithUserDetails = Prisma.MatchPlayerGetPayload<{
  include: {
    dashboard_player: {
      include: {
        user: true;
      };
    };
  };
}>;

export class MatchPlayerRepo {
  static async getAllMatchPlayers(): Promise<MatchPlayerWithDetails[]> {
    return prisma.matchPlayer.findMany({
      include: {
        dashboard_player: true,
      },
    });
  }

  static async getMatchPlayerById(
    id: string
  ): Promise<MatchPlayerWithDetails | null> {
    return prisma.matchPlayer.findUnique({
      where: { id },
      include: {
        dashboard_player: true,
      },
    });
  }

  static async getMatchPlayersFromMatch(
    match_id: string
  ): Promise<MatchPlayerWithUserDetails[]> {
    return prisma.matchPlayer.findMany({
      where: { match_id },
      include: {
        dashboard_player: {
          include: { user: true },
        },
      },
    });
  }

  static async createMatchPlayer(
    matchPlayer: Omit<MatchPlayer, "id">,
    tx?: PrismaTransaction
  ): Promise<MatchPlayer> {
    const prismaClient = tx || prisma;
    return prismaClient.matchPlayer.create({
      data: matchPlayer,
    });
  }

  static async createMatchPlayers(
    matchPlayers: Omit<MatchPlayer, "id">[],
    tx?: PrismaTransaction
  ): Promise<{ count: number }> {
    const prismaClient = tx || prisma;
    return prismaClient.matchPlayer.createMany({
      data: matchPlayers,
    });
  }

  static async updateMatchPlayer(
    id: string,
    data: Partial<MatchPlayer>
  ): Promise<MatchPlayer> {
    return prisma.matchPlayer.update({ where: { id }, data });
  }

  static async deleteMatchPlayer(id: string): Promise<MatchPlayer> {
    return prisma.matchPlayer.delete({ where: { id } });
  }

  static async deleteMatchPlayersFromMatch(
    match_id: string,
    tx?: PrismaTransaction
  ) {
    const prismaClient = tx || prisma;
    return prismaClient.matchPlayer.deleteMany({ where: { match_id } });
  }

  static async isPlayerInMatch(
    playerId: string,
    matchId: string
  ): Promise<boolean> {
    const player = await prisma.matchPlayer.findFirst({
      where: {
        match_id: matchId,
        dashboard_player_id: playerId,
      },
    });
    return player !== null;
  }
}
