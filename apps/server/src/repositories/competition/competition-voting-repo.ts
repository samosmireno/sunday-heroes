import { Prisma, VotingStatus } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaTransaction } from "../../types";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";

const COMPETITION_PENDING_VOTES_SELECT = {
  id: true,
  name: true,
  matches: {
    where: {
      votingStatus: VotingStatus.OPEN,
    },
    select: {
      id: true,
      date: true,
      homeTeamScore: true,
      awayTeamScore: true,
      penaltyHomeScore: true,
      penaltyAwayScore: true,
      matchTeams: {
        select: {
          team: {
            select: {
              name: true,
            },
          },
        },
      },
      matchPlayers: {
        select: {
          dashboardPlayerId: true,
          dashboardPlayer: {
            select: {
              nickname: true,
              votesGiven: {
                select: {
                  matchId: true,
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CompetitionSelect;

export type CompetitionWithPendingVotes = Prisma.CompetitionGetPayload<{
  select: typeof COMPETITION_PENDING_VOTES_SELECT;
}>;

export class CompetitionVotingRepo {
  static async findByIdWithPendingVotes(
    id: string,
    tx?: PrismaTransaction
  ): Promise<CompetitionWithPendingVotes | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.findUnique({
        where: {
          id,
          votingEnabled: true,
        },
        select: COMPETITION_PENDING_VOTES_SELECT,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "CompetitionVotingRepo.findByIdWithPendingVotes"
      );
    }
  }

  static async getVotingSettings(
    id: string,
    tx?: PrismaTransaction
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
    competition_id: string,
    tx?: PrismaTransaction
  ): Promise<VotingStatus | undefined> {
    try {
      const prismaClient = tx || prisma;
      const competition = await prismaClient.competition.findUnique({
        where: { id: competition_id },
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
