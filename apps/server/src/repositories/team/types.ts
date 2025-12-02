import { Prisma } from "@prisma/client";

export const TEAM_WITH_COMPETITIONS_INCLUDE = {
  teamCompetitions: true,
  teamRosters: {
    include: {
      dashboardPlayer: true,
    },
  },
} satisfies Prisma.TeamInclude;

export const TEAM_IN_COMPETITION_INCLUDE = {
  teamCompetitions: {
    include: {
      competition: true,
    },
  },
  teamRosters: {
    include: {
      dashboardPlayer: true,
    },
  },
} satisfies Prisma.TeamInclude;

export type TeamWithCompetitions = Prisma.TeamGetPayload<{
  include: typeof TEAM_WITH_COMPETITIONS_INCLUDE;
}>;

export type TeamInCompetition = Prisma.TeamGetPayload<{
  include: typeof TEAM_IN_COMPETITION_INCLUDE;
}>;
