import { Prisma } from "@prisma/client";

export const DASHBOARD_PLAYER_BASIC_INCLUDE = {
  user: {
    select: {
      id: true,
      email: true,
    },
  },
} satisfies Prisma.DashboardPlayerInclude;

export const DASHBOARD_PLAYER_WITH_DASHBOARD_DATA = {
  dashboard: {
    include: {
      competitions: {
        include: {
          matches: {
            include: {
              matchPlayers: {
                include: {
                  dashboardPlayer: {
                    include: {
                      votesGiven: true,
                    },
                  },
                  receivedVotes: true,
                },
              },
              matchTeams: {
                include: {
                  team: true,
                },
              },
              playerVotes: true,
              competition: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.DashboardPlayerInclude;

export const DASHBOARD_PLAYER_DETAILED_INCLUDE = {
  user: {
    select: {
      id: true,
      email: true,
      isRegistered: true,
    },
  },
  matchPlayers: {
    select: {
      match: {
        select: {
          id: true,
          competition: {
            select: {
              id: true,
              name: true,
            },
          },
          playerVotes: true,
        },
      },
      receivedVotes: true,
      goals: true,
      assists: true,
      rating: true,
    },
  },
} satisfies Prisma.DashboardPlayerInclude;

export const DASHBOARD_PLAYER_WITH_ADMIN_INCLUDE = {
  dashboard: {
    include: {
      admin: true,
    },
  },
} satisfies Prisma.DashboardPlayerInclude;

export type DashboardPlayerBasic = Prisma.DashboardPlayerGetPayload<{
  include: typeof DASHBOARD_PLAYER_BASIC_INCLUDE;
}>;

export type DashboardPlayerWithDashboardData =
  Prisma.DashboardPlayerGetPayload<{
    include: typeof DASHBOARD_PLAYER_WITH_DASHBOARD_DATA;
  }>;

export type DashboardCompetitionsType = Prisma.DashboardPlayerGetPayload<{
  include: typeof DASHBOARD_PLAYER_WITH_DASHBOARD_DATA;
}>["dashboard"]["competitions"];

export type DashboardPlayerWithAdmin = Prisma.DashboardPlayerGetPayload<{
  include: typeof DASHBOARD_PLAYER_WITH_ADMIN_INCLUDE;
}>;

export type DashboardPlayerWithDetails = Prisma.DashboardPlayerGetPayload<{
  include: typeof DASHBOARD_PLAYER_DETAILED_INCLUDE;
}>;
