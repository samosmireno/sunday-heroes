import { Competition, Prisma } from "@prisma/client";
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
    matches: {
      include: {
        matchPlayers: {
          include: {
            player: true;
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
        matches: {
          include: {
            matchPlayers: {
              include: {
                player: true,
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

  static async createCompetition(
    data: Omit<Competition, "id">
  ): Promise<Competition> {
    return prisma.competition.create({ data });
  }
}
