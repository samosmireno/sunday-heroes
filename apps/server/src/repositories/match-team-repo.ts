import { MatchTeam } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";

export class MatchTeamRepo {
  static async createMatchTeams(
    data: Omit<MatchTeam, "id">[],
    tx?: PrismaTransaction
  ): Promise<{ count: number }> {
    const prismaClient = tx || prisma;
    return prismaClient.matchTeam.createMany({ data });
  }

  static async create(
    matchId: string,
    teamId: string,
    isHome: boolean,
    tx?: PrismaTransaction
  ): Promise<MatchTeam> {
    const prismaClient = tx || prisma;
    return prismaClient.matchTeam.create({
      data: {
        match_id: matchId,
        team_id: teamId,
        is_home: isHome,
      },
    });
  }

  static async findByMatchId(
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<MatchTeam[]> {
    const prismaClient = tx || prisma;
    return prismaClient.matchTeam.findMany({
      where: { match_id: matchId },
      include: {
        team: true,
      },
    });
  }

  static async findByTeamId(
    teamId: string,
    tx?: PrismaTransaction
  ): Promise<MatchTeam[]> {
    const prismaClient = tx || prisma;
    return prismaClient.matchTeam.findMany({
      where: { team_id: teamId },
      include: {
        match: true,
        team: true,
      },
    });
  }

  static async findByMatchAndTeam(
    matchId: string,
    teamId: string,
    tx?: PrismaTransaction
  ): Promise<MatchTeam | null> {
    const prismaClient = tx || prisma;
    return prismaClient.matchTeam.findFirst({
      where: {
        match_id: matchId,
        team_id: teamId,
      },
      include: {
        team: true,
      },
    });
  }

  static async getHomeTeam(
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<MatchTeam | null> {
    const prismaClient = tx || prisma;
    return prismaClient.matchTeam.findFirst({
      where: {
        match_id: matchId,
        is_home: true,
      },
      include: {
        team: true,
      },
    });
  }

  static async getAwayTeam(
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<MatchTeam | null> {
    const prismaClient = tx || prisma;
    return prismaClient.matchTeam.findFirst({
      where: {
        match_id: matchId,
        is_home: false,
      },
      include: {
        team: true,
      },
    });
  }

  static async deleteByMatchId(
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<{ count: number }> {
    const prismaClient = tx || prisma;
    return prismaClient.matchTeam.deleteMany({
      where: { match_id: matchId },
    });
  }

  static async deleteByTeamId(
    teamId: string,
    tx?: PrismaTransaction
  ): Promise<{ count: number }> {
    const prismaClient = tx || prisma;
    return prismaClient.matchTeam.deleteMany({
      where: { team_id: teamId },
    });
  }

  static async update(
    id: string,
    data: Partial<MatchTeam>,
    tx?: PrismaTransaction
  ): Promise<MatchTeam> {
    const prismaClient = tx || prisma;
    return prismaClient.matchTeam.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string, tx?: PrismaTransaction): Promise<MatchTeam> {
    const prismaClient = tx || prisma;
    return prismaClient.matchTeam.delete({
      where: { id },
    });
  }

  static async findTeamMatches(
    teamId: string,
    competitionId?: string,
    tx?: PrismaTransaction
  ): Promise<MatchTeam[]> {
    const prismaClient = tx || prisma;
    return prismaClient.matchTeam.findMany({
      where: {
        team_id: teamId,
        ...(competitionId && {
          match: {
            competition_id: competitionId,
          },
        }),
      },
      include: {
        match: {
          include: {
            match_teams: {
              include: {
                team: true,
              },
            },
          },
        },
        team: true,
      },
      orderBy: {
        match: {
          date: "desc",
        },
      },
    });
  }

  static async updateTeamReferences(
    oldTeamId: string,
    newTeamId: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    const prismaClient = tx || prisma;
    await prismaClient.matchTeam.updateMany({
      where: { team_id: oldTeamId },
      data: { team_id: newTeamId },
    });
  }
}
