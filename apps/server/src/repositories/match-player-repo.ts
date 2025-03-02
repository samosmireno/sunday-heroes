import { MatchPlayer, Prisma, Team } from "@prisma/client";
import prisma from "./prisma-client";

type MatchPlayerWithDetails = Prisma.MatchPlayerGetPayload<{
  include: {
    player: true;
  };
}>;

export class MatchPlayerRepo {
  static async getAllMatchPlayers(): Promise<MatchPlayerWithDetails[]> {
    return prisma.matchPlayer.findMany({
      include: {
        player: true,
      },
    });
  }

  static async getMatchPlayerById(
    id: string
  ): Promise<MatchPlayerWithDetails | null> {
    return prisma.matchPlayer.findUnique({
      where: { id },
      include: {
        player: true,
      },
    });
  }

  static async getMatchPlayersFromMatch(
    match_id: string
  ): Promise<MatchPlayerWithDetails[]> {
    return prisma.matchPlayer.findMany({
      where: { match_id },
      include: {
        player: true,
      },
    });
  }

  static async createMatchPlayer(
    matchPlayer: Omit<MatchPlayer, "id">
  ): Promise<MatchPlayer> {
    return prisma.matchPlayer.create({
      data: matchPlayer,
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

  static async deleteMatchPlayersFromMatch(match_id: string) {
    return prisma.matchPlayer.deleteMany({ where: { match_id } });
  }
}
