import { Prisma } from "@prisma/client";

export const USER_WITH_DASHBOARD_INCLUDE = {
  dashboard: true,
} satisfies Prisma.UserInclude;

export type UserWithDashboard = Prisma.UserGetPayload<{
  include: typeof USER_WITH_DASHBOARD_INCLUDE;
}>;
