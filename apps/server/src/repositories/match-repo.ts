import { Match, Prisma, VotingStatus } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";

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
      throw PrismaErrorHandler.handle(error, "MatchRepo.findById");
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
      throw PrismaErrorHandler.handle(error, "MatchRepo.findByIdWithDetails");
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
      throw PrismaErrorHandler.handle(error, "MatchRepo.findByIdWithTeams");
    }
  }

  static async findAll(tx?: PrismaTransaction): Promise<Match[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.findMany({
        orderBy: { date: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.findAll");
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
      throw PrismaErrorHandler.handle(error, "MatchRepo.findAllWithDetails");
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
      throw PrismaErrorHandler.handle(error, "MatchRepo.findByCompetitionId");
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
      throw PrismaErrorHandler.handle(error, "MatchRepo.findByCompetitionIds");
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
      throw PrismaErrorHandler.handle(error, "MatchRepo.findByPlayerId");
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
      throw PrismaErrorHandler.handle(error, "MatchRepo.findWithExpiredVoting");
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
      throw PrismaErrorHandler.handle(error, "MatchRepo.create");
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
      throw PrismaErrorHandler.handle(error, "MatchRepo.update");
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
      throw PrismaErrorHandler.handle(error, "MatchRepo.updateVotingStatus");
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
      throw PrismaErrorHandler.handle(
        error,
        "MatchRepo.updateManyVotingStatus"
      );
    }
  }

  static async delete(id: string, tx?: PrismaTransaction): Promise<Match> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.match.delete({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "MatchRepo.delete");
    }
  }
}
