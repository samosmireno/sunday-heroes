import { Match, Prisma, VotingStatus } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";

const MATCH_DETAILED_INCLUDE = {
  matchPlayers: {
    include: {
      dashboard_player: {
        include: {
          votes_given: true,
        },
      },
      received_votes: true,
      team: true,
    },
  },
  match_teams: {
    include: {
      team: true,
    },
  },
  player_votes: true,
  competition: {
    include: {
      moderators: {
        select: {
          dashboard_player: {
            select: {
              user_id: true,
            },
          },
        },
      },
      dashboard: {
        select: {
          admin_id: true,
        },
      },
    },
  },
} satisfies Prisma.MatchInclude;

const MATCH_BASIC_INCLUDE = {
  match_teams: {
    include: {
      team: true,
    },
  },
  competition: true,
  matchPlayers: {
    select: {
      id: true,
    },
  },
} satisfies Prisma.MatchInclude;

export type MatchWithDetails = Prisma.MatchGetPayload<{
  include: typeof MATCH_DETAILED_INCLUDE;
}>;

export type MatchWithTeams = Prisma.MatchGetPayload<{
  include: typeof MATCH_BASIC_INCLUDE;
}>;

export class MatchRepo {
  static async findById(
    id: string,
    tx?: PrismaTransaction
  ): Promise<Match | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findUnique({ where: { id } });
    } catch (error) {
      console.error("Error in MatchRepo.findById:", error);
      throw new Error("Failed to fetch match");
    }
  }

  static async findByIdWithDetails(
    id: string,
    tx?: PrismaTransaction
  ): Promise<MatchWithDetails | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findUnique({
        where: { id },
        include: MATCH_DETAILED_INCLUDE,
      });
    } catch (error) {
      console.error("Error in MatchRepo.findByIdWithDetails:", error);
      throw new Error("Failed to fetch match with details");
    }
  }

  static async findByIdWithTeams(
    id: string,
    tx?: PrismaTransaction
  ): Promise<MatchWithTeams | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findUnique({
        where: { id },
        include: MATCH_BASIC_INCLUDE,
      });
    } catch (error) {
      console.error("Error in MatchRepo.findByIdWithTeams:", error);
      throw new Error("Failed to fetch match with teams");
    }
  }

  static async findAll(tx?: PrismaTransaction): Promise<Match[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findMany({
        orderBy: { date: "desc" },
      });
    } catch (error) {
      console.error("Error in MatchRepo.findAll:", error);
      throw new Error("Failed to fetch matches");
    }
  }

  static async findAllWithDetails(
    tx?: PrismaTransaction
  ): Promise<MatchWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findMany({
        include: MATCH_DETAILED_INCLUDE,
        orderBy: { date: "desc" },
      });
    } catch (error) {
      console.error("Error in MatchRepo.findAllWithDetails:", error);
      throw new Error("Failed to fetch matches with details");
    }
  }

  static async findByCompetitionId(
    competitionId: string,
    options?: { limit?: number; offset?: number },
    tx?: PrismaTransaction
  ): Promise<MatchWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findMany({
        where: { competition_id: competitionId },
        include: MATCH_DETAILED_INCLUDE,
        orderBy: { date: "desc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      console.error("Error in MatchRepo.findByCompetitionId:", error);
      throw new Error("Failed to fetch matches by competition");
    }
  }

  static async findByCompetitionIds(
    competitionIds: string[]
  ): Promise<Match[]> {
    try {
      return await prisma.match.findMany({
        where: {
          competition_id: { in: competitionIds },
        },
        include: MATCH_DETAILED_INCLUDE,
        orderBy: { date: "desc" },
      });
    } catch (error) {
      console.error("Error in MatchRepo.findByCompetitionIds:", error);
      throw new Error("Failed to fetch matches by competition IDs");
    }
  }

  static async findByDashboardId(
    dashboardId: string,
    options?: { limit?: number; offset?: number },
    tx?: PrismaTransaction
  ): Promise<MatchWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findMany({
        where: {
          competition: {
            dashboard_id: dashboardId,
          },
        },
        include: MATCH_DETAILED_INCLUDE,
        orderBy: { date: "desc" },
        take: options?.limit,
        skip: options?.offset,
      });
    } catch (error) {
      console.error("Error in MatchRepo.findByDashboardId:", error);
      throw new Error("Failed to fetch matches by dashboard");
    }
  }

  static async findByPlayerId(
    playerId: string,
    options?: { limit?: number; offset?: number },
    tx?: PrismaTransaction
  ): Promise<MatchWithDetails[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findMany({
        where: {
          matchPlayers: {
            some: {
              dashboard_player: {
                user_id: playerId,
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
      console.error("Error in MatchRepo.findByPlayerId:", error);
      throw new Error("Failed to fetch matches by player");
    }
  }

  static async findWithExpiredVoting(tx?: PrismaTransaction): Promise<Match[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findMany({
        where: {
          voting_status: "OPEN",
          voting_ends_at: {
            not: null,
            lt: new Date(),
          },
        },
      });
    } catch (error) {
      console.error("Error in MatchRepo.findWithExpiredVoting:", error);
      throw new Error("Failed to fetch expired voting matches");
    }
  }

  static async create(
    data: Omit<Match, "id">,
    tx?: PrismaTransaction
  ): Promise<Match> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.create({ data });
    } catch (error) {
      console.error("Error in MatchRepo.create:", error);
      throw new Error("Failed to create match");
    }
  }

  static async update(
    id: string,
    data: Partial<Match>,
    tx?: PrismaTransaction
  ): Promise<Match> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.update({ where: { id }, data });
    } catch (error) {
      console.error("Error in MatchRepo.update:", error);
      throw new Error("Failed to update match");
    }
  }

  static async updateVotingStatus(
    matchId: string,
    status: VotingStatus,
    votingEndDate?: Date,
    tx?: PrismaTransaction
  ): Promise<Match> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.update({
        where: { id: matchId },
        data: {
          voting_status: status,
          ...(status === "CLOSED" ? { voting_ends_at: new Date() } : {}),
          ...(votingEndDate ? { voting_ends_at: votingEndDate } : {}),
        },
      });
    } catch (error) {
      console.error("Error in MatchRepo.updateVotingStatus:", error);
      throw new Error("Failed to update voting status");
    }
  }

  static async updateManyVotingStatus(
    matchIds: string[],
    status: VotingStatus,
    tx?: PrismaTransaction
  ): Promise<void> {
    try {
      const prismaClient = tx || prisma;
      await prismaClient.match.updateMany({
        where: { id: { in: matchIds } },
        data: {
          voting_status: status,
          ...(status === "CLOSED" ? { voting_ends_at: new Date() } : {}),
        },
      });
    } catch (error) {
      console.error("Error in MatchRepo.updateManyVotingStatus:", error);
      throw new Error("Failed to update voting status for multiple matches");
    }
  }

  static async delete(id: string, tx?: PrismaTransaction): Promise<Match> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.delete({ where: { id } });
    } catch (error) {
      console.error("Error in MatchRepo.delete:", error);
      throw new Error("Failed to delete match");
    }
  }
}
