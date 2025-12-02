import { Prisma } from "@prisma/client";

export const REFRESH_TOKEN_WITH_USER_INCLUDE = {
  user: {
    select: {
      id: true,
      email: true,
      givenName: true,
      familyName: true,
    },
  },
} satisfies Prisma.RefreshTokenInclude;

export type RefreshTokenWithUser = Prisma.RefreshTokenGetPayload<{
  include: typeof REFRESH_TOKEN_WITH_USER_INCLUDE;
}>;
