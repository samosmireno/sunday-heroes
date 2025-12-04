import { Match, Prisma, VotingStatus } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";
import { config } from "../../config/config";
import {
  COMPETITION_MATCH_SELECT,
  CompetitionMatch,
  MATCH_BASIC_INCLUDE,
  MATCH_DETAILED_INCLUDE,
  MATCH_VOTES_INCLUDE,
  MatchWithDetails,
  MatchWithTeams,
  MatchWithVotes,
} from "./types";

export class MatchRepo {
  static async findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<Match | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findUnique({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.findById");
    }
  }

  static async findByIdWithDetails(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<MatchWithDetails | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findUnique({
        where: { id },
        include: MATCH_DETAILED_INCLUDE,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.findByIdWithDetails");
    }
  }

  static async findByIdsWithDetails(
    ids: string[],
    tx?: Prisma.TransactionClient
  ): Promise<MatchWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findMany({
        where: { id: { in: ids } },
        include: MATCH_DETAILED_INCLUDE,
        orderBy: { date: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.findByIdWithDetails");
    }
  }

  static async findByIdWithVotes(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<MatchWithVotes | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findUnique({
        where: { id },
        include: MATCH_VOTES_INCLUDE,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.findByIdWithDetails");
    }
  }

  static async findByIdWithTeams(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<MatchWithTeams | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findUnique({
        where: { id },
        include: MATCH_BASIC_INCLUDE,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.findByIdWithTeams");
    }
  }

  static async findAll(tx?: Prisma.TransactionClient): Promise<Match[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findMany({
        orderBy: { date: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.findAll");
    }
  }

  static async findByCompetitionId(
    competitionId: string,
    options?: { limit?: number; offset?: number },
    tx?: Prisma.TransactionClient
  ): Promise<MatchWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findMany({
        where: { competitionId },
        include: MATCH_DETAILED_INCLUDE,
        orderBy: { date: "desc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.findByCompetitionId");
    }
  }

  static async countByCompetitionId(
    competitionId: string,
    tx?: Prisma.TransactionClient
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.count({
        where: { competitionId },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.findByCompetitionId");
    }
  }

  static async findByDashboardId(
    dashboardId: string,
    options?: { limit?: number; offset?: number },
    tx?: Prisma.TransactionClient
  ): Promise<MatchWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findMany({
        where: {
          competition: {
            dashboardId,
          },
          date: {
            not: null,
          },
        },
        include: MATCH_DETAILED_INCLUDE,
        orderBy: { date: "desc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.findByDashboardId");
    }
  }

  static async findByPlayerId(
    playerId: string,
    options?: { limit?: number; offset?: number },
    tx?: Prisma.TransactionClient
  ): Promise<MatchWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findMany({
        where: {
          matchPlayers: {
            some: {
              dashboardPlayer: {
                userId: playerId,
              },
            },
          },
        },
        include: MATCH_DETAILED_INCLUDE,
        orderBy: { date: "desc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.findByPlayerId");
    }
  }

  static async findMatchesForCompetitions(
    competitionIds: string[]
  ): Promise<CompetitionMatch[]> {
    return prisma.match.findMany({
      where: { competitionId: { in: competitionIds } },
      select: COMPETITION_MATCH_SELECT,
    });
  }

  static async findByUserWithDeduplication(
    userId: string,
    dashboardId: string,
    options?: { limit?: number; offset?: number },
    tx?: Prisma.TransactionClient
  ): Promise<string[]> {
    try {
      const prismaClient = tx || prisma;
      const matches = await prismaClient.match.findMany({
        where: {
          OR: [
            {
              matchPlayers: {
                some: {
                  dashboardPlayer: {
                    userId,
                  },
                },
              },
            },
            {
              competition: {
                dashboardId,
              },
              date: {
                not: null,
              },
            },
          ],
        },
        orderBy: { date: "desc" },
        take: options?.limit,
        skip: options?.offset,
      });

      return matches.map((match) => match.id);
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchRepo.findByUserWithDeduplication"
      );
    }
  }

  static async countByUserWithDeduplication(
    userId: string,
    dashboardId: string,
    tx?: Prisma.TransactionClient
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.count({
        where: {
          OR: [
            {
              matchPlayers: {
                some: {
                  dashboardPlayer: {
                    userId,
                  },
                },
              },
            },
            {
              competition: {
                dashboardId,
              },
              date: {
                not: null,
              },
            },
          ],
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchRepo.countByUserWithDeduplication"
      );
    }
  }

  static async findWithExpiredVoting(
    tx?: Prisma.TransactionClient
  ): Promise<Match[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findMany({
        where: {
          votingStatus: "OPEN",
          votingEndsAt: {
            not: null,
            lt: new Date(),
          },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.findWithExpiredVoting");
    }
  }

  static async findMatchesExpiringSoon(
    tx?: Prisma.TransactionClient
  ): Promise<MatchWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      const now = new Date();

      const matches = await prismaClient.match.findMany({
        where: {
          votingEndsAt: { not: null, gt: now },
          competition: {
            votingEnabled: { not: false },
            reminderDays: { not: null },
          },
        },
        include: MATCH_DETAILED_INCLUDE,
      });

      const expiringMatches = matches.filter((match) => {
        const reminderMs =
          (match.competition.reminderDays ?? 0) * 24 * 60 * 60 * 1000;
        return (
          match.votingEndsAt !== null &&
          match.votingEndsAt.getTime() - now.getTime() < reminderMs
        );
      });

      return expiringMatches.filter(
        (match) =>
          match.matchPlayers.length !==
          match.playerVotes.length / config.votes.maxVotesPerPlayer
      );
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchRepo.findMatchesExpiringSoon"
      );
    }
  }

  static async create(
    data: Omit<Match, "id">,
    tx?: Prisma.TransactionClient
  ): Promise<Match> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.create({ data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.create");
    }
  }

  static async update(
    id: string,
    data: Partial<Match>,
    tx?: Prisma.TransactionClient
  ): Promise<Match> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.update({ where: { id }, data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.update");
    }
  }

  static async updateVotingStatus(
    matchId: string,
    votingStatus: VotingStatus,
    votingEndDate?: Date,
    tx?: Prisma.TransactionClient
  ): Promise<Match> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.update({
        where: { id: matchId },
        data: {
          votingStatus,
          ...(votingStatus === "CLOSED" ? { votingEndsAt: new Date() } : {}),
          ...(votingEndDate ? { votingEndsAt: votingEndDate } : {}),
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.updateVotingStatus");
    }
  }

  static async updateManyVotingStatus(
    matchIds: string[],
    votingStatus: VotingStatus,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;
      await prismaClient.match.updateMany({
        where: { id: { in: matchIds } },
        data: {
          votingStatus,
          ...(votingStatus === "CLOSED" ? { votingEndsAt: new Date() } : {}),
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "MatchRepo.updateManyVotingStatus"
      );
    }
  }

  static async delete(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<Match> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.delete({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.delete");
    }
  }
}
