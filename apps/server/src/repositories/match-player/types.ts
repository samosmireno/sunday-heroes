import { Prisma } from "@prisma/client";

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
