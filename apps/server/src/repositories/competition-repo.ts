import { Competition, CompetitionType, Prisma } from "@prisma/client";
import prisma from "./prisma-client";

export type CompetitionWithMatches = Prisma.CompetitionGetPayload<{
  include: {
    matches: true;
    team_competitions: true;
  };
}>;

export type CompetitionWithDetails = Prisma.CompetitionGetPayload<{
  include: {
    dashboard: {
      select: {
        id: true;
      };
    };
    team_competitions: true;
    matches: {
      include: {
        matchPlayers: {
          include: {
            dashboard_player: true;
            received_votes: true;
          };
        };
        match_teams: {
          include: {
            team: true;
          };
        };
      };
    };
  };
}>;

export class CompetitionRepo {
  static async getAllCompetitionsFromDashboard(
    dashboard_id: string
  ): Promise<CompetitionWithMatches[]> {
    return prisma.competition.findMany({
      where: {
        dashboard_id,
      },
      include: {
        matches: true,
        team_competitions: true,
      },
    });
  }

  static async getAllDetailedCompetitionsFromDashboard(
    dashboard_id: string,
    page: number,
    limit: number,
    type?: CompetitionType,
    search?: string
  ): Promise<CompetitionWithDetails[]> {
    return prisma.competition.findMany({
      where: {
        dashboard_id,
        type: type,
        name: {
          startsWith: search,
          mode: "insensitive",
        },
      },
      skip: page * limit,
      take: limit,
      orderBy: {
        created_at: "desc",
      },
      include: {
        dashboard: {
          select: {
            id: true,
          },
        },
        team_competitions: true,
        matches: {
          include: {
            matchPlayers: {
              include: {
                dashboard_player: true,
                received_votes: true,
              },
            },
            match_teams: {
              include: {
                team: true,
              },
            },
          },
        },
      },
    });
  }

  static async getNumCompetitionsFromQuery(
    dashboard_id: string,
    type?: CompetitionType,
    search?: string
  ): Promise<number> {
    const competitions = await prisma.competition.findMany({
      where: {
        dashboard_id,
        type: type,
        name: {
          startsWith: search,
          mode: "insensitive",
        },
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        dashboard: {
          select: {
            id: true,
          },
        },
        team_competitions: true,
        matches: {
          include: {
            matchPlayers: {
              include: {
                dashboard_player: true,
                received_votes: true,
              },
            },
            match_teams: {
              include: {
                team: true,
              },
            },
          },
        },
      },
    });

    return competitions.length;
  }

  static async getCompetitionById(
    competition_id: string
  ): Promise<CompetitionWithDetails | null> {
    return prisma.competition.findUnique({
      where: {
        id: competition_id,
      },
      include: {
        dashboard: {
          select: {
            id: true,
          },
        },
        team_competitions: true,
        matches: {
          include: {
            matchPlayers: {
              include: {
                dashboard_player: true,
                received_votes: true,
              },
            },
            match_teams: {
              include: {
                team: true,
              },
            },
          },
        },
      },
    });
  }

  static async getCompetitionType(
    competition_id: string
  ): Promise<CompetitionType | undefined> {
    const competition = await prisma.competition.findUnique({
      where: { id: competition_id },
    });

    return competition?.type;
  }

  static async createCompetition(
    data: Omit<Competition, "id">
  ): Promise<Competition> {
    return prisma.competition.create({ data });
  }
}
