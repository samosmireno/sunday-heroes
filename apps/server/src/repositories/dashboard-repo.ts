import { Dashboard, Prisma } from "@prisma/client";
import prisma from "./prisma-client";

export type DashboardWithDetails = Prisma.DashboardGetPayload<{
  include: {
    admin: true;
    dashboard_players: true;
    competitions: {
      include: {
        matches: {
          include: {
            matchPlayers: {
              include: {
                dashboard_player: {
                  include: {
                    votes_given: true;
                  };
                };
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
    };
  };
}>;

export class DashboardRepo {
  static async createDashboard(
    data: Omit<Dashboard, "id">
  ): Promise<Dashboard> {
    return prisma.dashboard.create({ data });
  }

  static async getDashboardDetails(
    id: string
  ): Promise<DashboardWithDetails | null> {
    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
      include: {
        admin: true,
        dashboard_players: true,
        competitions: {
          include: {
            matches: {
              include: {
                matchPlayers: {
                  include: {
                    dashboard_player: {
                      include: {
                        votes_given: true,
                      },
                    },
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
        },
      },
    });
    return dashboard;
  }

  static async getDashboardIdFromCompetitionId(
    competitionId: string
  ): Promise<string> {
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: { dashboard_id: true },
    });
    if (!competition) {
      throw new Error(`Competition with id ${competitionId} not found`);
    }
    return competition.dashboard_id;
  }
}
