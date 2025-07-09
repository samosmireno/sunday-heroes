import { PlayerVote, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";

const VOTE_WITH_DETAILS_INCLUDE = {
  match: {
    select: {
      id: true,
      home_team_score: true,
      away_team_score: true,
      voting_status: true,
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
  player_match: {
    select: {
      id: true,
      dashboard_player: {
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
        orderBy: { created_at: "desc" },
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
        where: { match_id: matchId },
        include: VOTE_WITH_DETAILS_INCLUDE,
        orderBy: { created_at: "desc" },
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
        where: { voter_id: voterId },
        include: VOTE_WITH_DETAILS_INCLUDE,
        orderBy: { created_at: "desc" },
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
          voter_id: voterId,
          match_id: matchId,
        },
        orderBy: { created_at: "desc" },
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
          match_id: { in: matchIds },
        },
        include: VOTE_WITH_DETAILS_INCLUDE,
        orderBy: { created_at: "desc" },
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
        where: { match_id: matchId },
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
        where: { voter_id: voterId },
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
          voter_id: voterId,
          match_id: matchId,
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
        where: { match_id: matchId },
        select: { voter_id: true },
        distinct: ["voter_id"],
      });
      return voters.map((v) => v.voter_id);
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
        where: { match_id: matchId },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "VoteRepo.deleteByMatch");
    }
  }
}
