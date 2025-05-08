import { Match, Prisma, VotingStatus } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";

export type MatchWithDetails = Prisma.MatchGetPayload<{
  include: {
    matchPlayers: {
      include: {
        dashboard_player: true;
      };
    };
    match_teams: {
      include: {
        team: true;
      };
    };
  };
}>;

export type MatchWithTeams = Prisma.MatchGetPayload<{
  include: {
    match_teams: {
      include: {
        team: true;
      };
    };
    competition: true;
    matchPlayers: {
      select: {
        id: true;
      };
    };
  };
}>;

export class MatchRepo {
  static async getAllMatches(): Promise<Match[]> {
    return prisma.match.findMany();
  }

  static async getMatchById(id: string): Promise<Match | null> {
    return prisma.match.findUnique({ where: { id } });
  }

  static async getAllMatchesWithDetails(): Promise<MatchWithDetails[]> {
    return prisma.match.findMany({
      include: {
        matchPlayers: {
          include: {
            dashboard_player: true,
          },
        },
        match_teams: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  static async getMatchWithPlayersById(
    id: string
  ): Promise<MatchWithDetails | null> {
    return prisma.match.findUnique({
      where: { id },
      include: {
        matchPlayers: {
          include: {
            dashboard_player: true,
          },
        },
        match_teams: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  static async getAllMatchesFromDashboard(
    dashboard_id: string
  ): Promise<MatchWithTeams[]> {
    return prisma.match.findMany({
      where: {
        competition: {
          dashboard_id: dashboard_id,
        },
      },
      include: {
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
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  static async getAllMatchesFromCompetition(
    competition_id: string
  ): Promise<MatchWithDetails[]> {
    return prisma.match.findMany({
      where: {
        competition_id,
      },
      include: {
        matchPlayers: {
          include: {
            dashboard_player: true,
          },
        },
        match_teams: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  static async createMatch(
    data: Omit<Match, "id">,
    tx?: PrismaTransaction
  ): Promise<Match> {
    const prismaClient = tx || prisma;
    return prismaClient.match.create({ data });
  }

  static async updateMatch(
    id: string,
    data: Partial<Match>,
    tx?: PrismaTransaction
  ): Promise<Match> {
    const prismaClient = tx || prisma;
    return prismaClient.match.update({ where: { id }, data });
  }

  static async updateMatchVotingStatus(
    matchId: string,
    status: VotingStatus,
    votingEndDate: Date,
    tx?: PrismaTransaction
  ) {
    const prismaClient = tx || prisma;
    return await prismaClient.match.update({
      where: { id: matchId },
      data: {
        voting_status: status,
        ...(status === "CLOSED" ? { voting_ends_at: new Date() } : {}),
      },
    });
  }

  static async deleteMatch(id: string): Promise<Match> {
    return prisma.match.delete({ where: { id } });
  }

  static async closeExpiredMatchVoting(): Promise<void> {
    const now = new Date();

    const result = await prisma.match.updateMany({
      where: {
        voting_status: "OPEN",
        voting_ends_at: {
          not: null,
          lt: now,
        },
      },
      data: {
        voting_status: "CLOSED",
      },
    });
  }

  static async closeExpiredMatchVotingTest() {
    const expiredMatches = await prisma.match.findMany({
      where: {
        voting_status: "OPEN",
        voting_ends_at: {
          not: null,
          lt: new Date(),
        },
      },
      select: {
        id: true,
        date: true,
        voting_ends_at: true,
        competition: {
          select: {
            name: true,
          },
        },
        match_teams: {
          select: {
            team: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    console.log(expiredMatches);
  }
}
