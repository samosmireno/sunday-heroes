import { Dashboard, Prisma } from "@prisma/client";
import prisma from "./prisma-client";

export type DashboardWithDetails = Prisma.DashboardGetPayload<{
  include: {
    admin: true;
    competitions: {
      include: {
        matches: {
          include: {
            matchPlayers: {
              include: {
                player: {
                  include: {
                    votes_given: true;
                  };
                };
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
        competitions: {
          include: {
            matches: {
              include: {
                matchPlayers: {
                  include: {
                    player: {
                      include: {
                        votes_given: true,
                      },
                    },
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
}
