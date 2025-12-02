import { Prisma, VotingStatus } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";

export class CompetitionVotingRepo {
  static async getVotingSettings(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<{
    votingEnabled: boolean;
    votingPeriodDays: number | null;
  } | null> {
    try {
      const prismaClient = tx || prisma;
      const competition = await prismaClient.competition.findUnique({
        where: { id },
        select: {
          votingEnabled: true,
          votingPeriodDays: true,
        },
      });
      return competition;
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionVotingRepo.getVotingSettings"
      );
    }
  }

  static async getVotingStatus(
    competitionId: string,
    tx?: Prisma.TransactionClient
  ): Promise<VotingStatus | undefined> {
    try {
      const prismaClient = tx || prisma;
      const competition = await prismaClient.competition.findUnique({
        where: { id: competitionId },
        select: {
          votingEnabled: true,
        },
      });
      return competition?.votingEnabled
        ? VotingStatus.OPEN
        : VotingStatus.CLOSED;
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionVotingRepo.getVotingStatus"
      );
    }
  }
}
