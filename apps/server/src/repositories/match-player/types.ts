import { Prisma } from "@prisma/client";

export const MATCH_PLAYER_WITH_MATCH_DETAILS_SELECT = {
  dashboardPlayerId: true,
  matchId: true,
  goals: true,
  assists: true,
  rating: true,
  isHome: true,
  match: {
    select: {
      id: true,
      date: true,
      homeTeamScore: true,
      awayTeamScore: true,
      round: true,
      competition: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      matchTeams: {
        select: {
          team: {
            select: {
              name: true,
            },
          },
          isHome: true,
        },
      },
    },
  },
};

export type MatchPlayerWithDetails = Prisma.MatchPlayerGetPayload<{
  include: {
    dashboardPlayer: true;
  };
}>;

export type MatchPlayerWithUserDetails = Prisma.MatchPlayerGetPayload<{
  include: {
    dashboardPlayer: {
      include: {
        user: true;
      };
    };
  };
}>;

export type MatchPlayerWithMatchDetails = Prisma.MatchPlayerGetPayload<{
  select: typeof MATCH_PLAYER_WITH_MATCH_DETAILS_SELECT;
}>;
