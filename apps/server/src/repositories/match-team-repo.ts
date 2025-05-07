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

  static async createMatchTeam(
    data: Omit<MatchTeam, "id">,
    tx?: PrismaTransaction
  ): Promise<MatchTeam> {
    const prismaClient = tx || prisma;
    return prismaClient.matchTeam.create({ data });
  }
}
