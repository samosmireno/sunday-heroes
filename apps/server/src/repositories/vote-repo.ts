import { PlayerVote, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";

// Define reusable include patterns (DRY principle)
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

// Type definitions using the includes
export type VoteWithDetails = Prisma.PlayerVoteGetPayload<{
  include: typeof VOTE_WITH_DETAILS_INCLUDE;
}>;

export class VoteRepo {
  // BASIC CRUD OPERATIONS
  static async findById(
    id: string,
    tx?: PrismaTransaction
  ): Promise<PlayerVote | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.findUnique({ where: { id } });
    } catch (error) {
      console.error("Error in VoteRepo.findById:", error);
      throw new Error("Failed to fetch vote");
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
      console.error("Error in VoteRepo.findByIdWithDetails:", error);
      throw new Error("Failed to fetch vote with details");
    }
  }

  // SIMPLE FILTERED QUERIES (Repository responsibility)
  static async findAll(tx?: PrismaTransaction): Promise<PlayerVote[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.findMany({
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error in VoteRepo.findAll:", error);
      throw new Error("Failed to fetch votes");
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
      console.error("Error in VoteRepo.findByMatchId:", error);
      throw new Error("Failed to fetch votes by match");
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
      console.error("Error in VoteRepo.findByVoterId:", error);
      throw new Error("Failed to fetch votes by voter");
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
      console.error("Error in VoteRepo.findByVoterAndMatch:", error);
      throw new Error("Failed to fetch votes by voter and match");
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
      console.error("Error in VoteRepo.findByMatchIds:", error);
      throw new Error("Failed to fetch votes by match IDs");
    }
  }

  // Simple count operations
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
      console.error("Error in VoteRepo.countByMatch:", error);
      throw new Error("Failed to count votes by match");
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
      console.error("Error in VoteRepo.countByVoter:", error);
      throw new Error("Failed to count votes by voter");
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
      console.error("Error in VoteRepo.countByVoterAndMatch:", error);
      throw new Error("Failed to count votes by voter and match");
    }
  }

  // Simple attribute getters
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
      console.error("Error in VoteRepo.getDistinctVotersByMatch:", error);
      throw new Error("Failed to get distinct voters by match");
    }
  }

  // CREATE/UPDATE/DELETE OPERATIONS
  static async create(
    data: Omit<PlayerVote, "id">,
    tx?: PrismaTransaction
  ): Promise<PlayerVote> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.create({ data });
    } catch (error) {
      console.error("Error in VoteRepo.create:", error);
      throw new Error("Failed to create vote");
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
      console.error("Error in VoteRepo.createMany:", error);
      throw new Error("Failed to create votes");
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
      console.error("Error in VoteRepo.update:", error);
      throw new Error("Failed to update vote");
    }
  }

  static async delete(id: string, tx?: PrismaTransaction): Promise<PlayerVote> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.playerVote.delete({ where: { id } });
    } catch (error) {
      console.error("Error in VoteRepo.delete:", error);
      throw new Error("Failed to delete vote");
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
      console.error("Error in VoteRepo.deleteByMatch:", error);
      throw new Error("Failed to delete votes by match");
    }
  }
}
