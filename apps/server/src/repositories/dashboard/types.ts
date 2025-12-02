import { Prisma } from "@prisma/client";

export const DASHBOARD_BASIC_INCLUDE = {
  admin: true,
  dashboardPlayers: true,
} satisfies Prisma.DashboardInclude;

export const DASHBOARD_DETAILED_INCLUDE = {
  admin: true,
  dashboardPlayers: true,
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
} satisfies Prisma.DashboardInclude;

export type DashboardMatchesType = Prisma.DashboardGetPayload<{
  include: typeof DASHBOARD_DETAILED_INCLUDE;
}>["competitions"][number]["matches"];

export type DashboardWithBasic = Prisma.DashboardGetPayload<{
  include: typeof DASHBOARD_BASIC_INCLUDE;
}>;

export type DashboardWithDetails = Prisma.DashboardGetPayload<{
  include: typeof DASHBOARD_DETAILED_INCLUDE;
}>;
