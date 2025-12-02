import { Prisma } from "@prisma/client";

export const COMPETITION_BASIC_INCLUDE = {
  matches: true,
  teamCompetitions: true,
} satisfies Prisma.CompetitionInclude;

export const COMPETITION_BASIC_SELECT = {
  id: true,
  name: true,
  type: true,
  votingEnabled: true,
} satisfies Prisma.CompetitionSelect;

export const COMPETITION_LIST_SELECT = {
  id: true,
  name: true,
  type: true,
  votingEnabled: true,
  dashboardId: true,
} satisfies Prisma.CompetitionSelect;

export const COMPETITION_SETTINGS_INCLUDE = {
  dashboard: {
    select: {
      id: true,
      adminId: true,
    },
  },
  moderators: {
    select: {
      id: true,
      dashboardPlayer: {
        select: {
          nickname: true,
          id: true,
          userId: true,
        },
      },
    },
  },
} satisfies Prisma.CompetitionInclude;

export const COMPETITION_TEAMS_INCLUDE = {
  teamCompetitions: {
    include: {
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.CompetitionInclude;

export const COMPETITION_DETAILED_INCLUDE = {
  dashboard: {
    select: {
      id: true,
      adminId: true,
    },
  },
  moderators: {
    select: {
      id: true,
      dashboardPlayer: {
        select: {
          nickname: true,
          id: true,
          userId: true,
        },
      },
    },
  },
  matches: {
    include: {
      matchPlayers: {
        include: {
          dashboardPlayer: true,
          receivedVotes: true,
        },
      },
      matchTeams: {
        include: {
          team: true,
        },
      },
      playerVotes: true,
    },
    orderBy: {
      date: "desc",
    },
  },
} satisfies Prisma.CompetitionInclude;

export type CompetitionWithMatches = Prisma.CompetitionGetPayload<{
  include: typeof COMPETITION_BASIC_INCLUDE;
}>;

export type CompetitionBasic = Prisma.CompetitionGetPayload<{
  select: typeof COMPETITION_BASIC_SELECT;
}>;

export type CompetitionListSelect = Prisma.CompetitionGetPayload<{
  select: typeof COMPETITION_LIST_SELECT;
}>;

export type CompetitionWithSettings = Prisma.CompetitionGetPayload<{
  include: typeof COMPETITION_SETTINGS_INCLUDE;
}>;

export type CompetitionWithTeamCompetitions = Prisma.CompetitionGetPayload<{
  include: typeof COMPETITION_TEAMS_INCLUDE;
}>;

export type CompetitionWithDetails = Prisma.CompetitionGetPayload<{
  include: typeof COMPETITION_DETAILED_INCLUDE;
}>;
