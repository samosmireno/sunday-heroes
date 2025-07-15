import { PlayerVote, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";

const VOTE_WITH_DETAILS_INCLUDE = {
  match: {
    select: {
      id: true,
      homeTeamScore: true,
      awayTeamScore: true,
      votingStatus: true,
      competition: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  },
  voter: {
    select: {
      id: true,
      nickname: true,
    },
  },
  matchPlayer: {
    select: {
      id: true,
      dashboardPlayer: {
        select: {
          id: true,
          nickname: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.PlayerVoteInclude;

export type VoteWithDetails = Prisma.PlayerVoteGetPayload<{
  include: typeof VOTE_WITH_DETAILS_INCLUDE;
}>;

export class VoteRepo {
  static async findById(
    id: string,
    tx?: PrismaTransaction
  ): Promise<PlayerVote | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.findUnique({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.findById");
    }
  }

  static async findByIdWithDetails(
    id: string,
    tx?: PrismaTransaction
  ): Promise<VoteWithDetails | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.findUnique({
        where: { id },
        include: VOTE_WITH_DETAILS_INCLUDE,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.findByIdWithDetails");
    }
  }

  static async findAll(tx?: PrismaTransaction): Promise<PlayerVote[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.findAll");
    }
  }

  static async findByMatchId(
    matchId: string,
    options?: { limit?: number; offset?: number },
    tx?: PrismaTransaction
  ): Promise<VoteWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.findMany({
        where: { matchId },
        include: VOTE_WITH_DETAILS_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.findByMatchId");
    }
  }

  static async findByVoterId(
    voterId: string,
    options?: { limit?: number; offset?: number },
    tx?: PrismaTransaction
  ): Promise<VoteWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.findMany({
        where: { voterId },
        include: VOTE_WITH_DETAILS_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.findByVoterId");
    }
  }

  static async findByVoterAndMatch(
    voterId: string,
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<PlayerVote[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.findMany({
        where: {
          voterId,
          matchId,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.findByVoterAndMatch");
    }
  }

  static async findByMatchIds(
    matchIds: string[],
    tx?: PrismaTransaction
  ): Promise<VoteWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.findMany({
        where: {
          matchId: { in: matchIds },
        },
        include: VOTE_WITH_DETAILS_INCLUDE,
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.findByMatchIds");
    }
  }

  static async countByMatch(
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.count({
        where: { matchId },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.countByMatch");
    }
  }

  static async countByVoter(
    voterId: string,
    tx?: PrismaTransaction
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.count({
        where: { voterId },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.countByVoter");
    }
  }

  static async countByVoterAndMatch(
    voterId: string,
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.count({
        where: {
          voterId,
          matchId,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.countByVoterAndMatch");
    }
  }

  static async getDistinctVotersByMatch(
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<string[]> {
    try {
      const prismaClient = tx || prisma;
      const voters = await prismaClient.playerVote.findMany({
        where: { matchId },
        select: { voterId: true },
        distinct: ["voterId"],
      });
      return voters.map((v) => v.voterId);
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "VoteRepo.getDistinctVotersByMatch"
      );
    }
  }

  static async create(
    data: Omit<PlayerVote, "id">,
    tx?: PrismaTransaction
  ): Promise<PlayerVote> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.create({ data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.create");
    }
  }

  static async createMany(
    data: Omit<PlayerVote, "id">[],
    tx?: PrismaTransaction
  ): Promise<{ count: number }> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.createMany({ data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.createMany");
    }
  }

  static async update(
    id: string,
    data: Partial<PlayerVote>,
    tx?: PrismaTransaction
  ): Promise<PlayerVote> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.update({ where: { id }, data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.update");
    }
  }

  static async delete(id: string, tx?: PrismaTransaction): Promise<PlayerVote> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.delete({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.delete");
    }
  }

  static async deleteByMatch(
    matchId: string,
    tx?: PrismaTransaction
  ): Promise<{ count: number }> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.deleteMany({
        where: { matchId },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.deleteByMatch");
    }
  }
}
