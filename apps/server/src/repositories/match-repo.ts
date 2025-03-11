import { Match, Prisma } from "@prisma/client";
import prisma from "./prisma-client";

export type MatchWithDetails = Prisma.MatchGetPayload<{
  include: {
    matchPlayers: {
      include: {
        player: true;
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
            player: true,
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
            player: true,
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
            player: true,
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

  static async createMatch(data: Omit<Match, "id">): Promise<Match> {
    return prisma.match.create({ data });
  }

  static async updateMatch(id: string, data: Partial<Match>): Promise<Match> {
    return prisma.match.update({ where: { id }, data });
  }

  static async deleteMatch(id: string): Promise<Match> {
    return prisma.match.delete({ where: { id } });
  }
}
