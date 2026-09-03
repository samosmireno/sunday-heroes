import { Prisma } from "@prisma/client";

/** What a Match read needs to tag the Match with its Season (number, open or closed). */
export const MATCH_SEASON_SELECT = {
  select: {
    number: true,
    endedAt: true,
  },
} satisfies Prisma.SeasonDefaultArgs;

export const MATCH_DETAILED_INCLUDE = {
  season: MATCH_SEASON_SELECT,
  matchPlayers: {
    include: {
      dashboardPlayer: {
        include: {
          votesGiven: true,
          user: true,
        },
      },
      receivedVotes: true,
      team: true,
    },
  },
  matchTeams: {
    include: {
      team: true,
    },
  },
  playerVotes: true,
  competition: {
    include: {
      moderators: {
        select: {
          dashboardPlayer: {
            select: {
              userId: true,
            },
          },
        },
      },
      dashboard: {
        select: {
          adminId: true,
        },
      },
    },
  },
} satisfies Prisma.MatchInclude;

export const MATCH_VOTES_INCLUDE = {
  matchPlayers: {
    include: {
      dashboardPlayer: {
        include: {
          votesGiven: true,
          user: true,
        },
      },
    },
  },
  matchTeams: {
    include: {
      team: true,
    },
  },
} satisfies Prisma.MatchInclude;

export const MATCH_BASIC_INCLUDE = {
  matchTeams: {
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
} satisfies Prisma.MatchInclude;

export const COMPETITION_MATCH_SELECT = {
  id: true,
  date: true,
  matchType: true,
  round: true,
  homeTeamScore: true,
  awayTeamScore: true,
  penaltyHomeScore: true,
  penaltyAwayScore: true,
  votingStatus: true,

  competition: {
    select: {
      id: true,
      name: true,
      type: true,
    },
  },

  matchTeams: {
    select: {
      team: { select: { name: true } },
    },
  },

  matchPlayers: {
    select: {
      dashboardPlayerId: true,
    },
  },

  playerVotes: {
    select: {
      voterId: true,
    },
  },
} satisfies Prisma.MatchSelect;

export type MatchWithDetails = Prisma.MatchGetPayload<{
  include: typeof MATCH_DETAILED_INCLUDE;
}>;

export type MatchWithVotes = Prisma.MatchGetPayload<{
  include: typeof MATCH_VOTES_INCLUDE;
}>;

export type MatchWithTeams = Prisma.MatchGetPayload<{
  include: typeof MATCH_BASIC_INCLUDE;
}>;

export type CompetitionMatch = Prisma.MatchGetPayload<{
  select: typeof COMPETITION_MATCH_SELECT;
}>;
