import { Prisma } from "@prisma/client";

export const VOTE_WITH_DETAILS_INCLUDE = {
  match: {
    select: {
      id: true,
      homeTeamScore: true,
      awayTeamScore: true,
      votingStatus: true,
      competition: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  },
  voter: {
    select: {
      id: true,
      nickname: true,
    },
  },
  matchPlayer: {
    select: {
      id: true,
      dashboardPlayer: {
        select: {
          id: true,
          nickname: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.PlayerVoteInclude;

export type VoteWithDetails = Prisma.PlayerVoteGetPayload<{
  include: typeof VOTE_WITH_DETAILS_INCLUDE;
}>;
