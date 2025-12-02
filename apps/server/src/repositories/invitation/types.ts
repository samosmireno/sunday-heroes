import { Prisma } from "@prisma/client";

export const INVITATION_WITH_DETAILS_INCLUDE = {
  invitedBy: true,
  dashboardPlayer: {
    include: {
      dashboard: true,
    },
  },
} satisfies Prisma.DashboardInvitationInclude;

export const INVITATION_WITH_BASIC_INCLUDE = {
  invitedBy: {
    select: {
      givenName: true,
      familyName: true,
      email: true,
    },
  },
  dashboardPlayer: {
    select: {
      nickname: true,
    },
  },
  usedByUser: {
    select: {
      givenName: true,
      familyName: true,
      email: true,
    },
  },
} satisfies Prisma.DashboardInvitationInclude;

export const INVITATION_WITH_DASHBOARD_INCLUDE = {
  dashboardPlayer: {
    include: {
      dashboard: {
        select: {
          name: true,
        },
      },
    },
  },
  usedByUser: {
    select: {
      givenName: true,
      familyName: true,
      email: true,
    },
  },
} satisfies Prisma.DashboardInvitationInclude;

export type InvitationWithDetails = Prisma.DashboardInvitationGetPayload<{
  include: typeof INVITATION_WITH_DETAILS_INCLUDE;
}>;

export type InvitationWithBasic = Prisma.DashboardInvitationGetPayload<{
  include: typeof INVITATION_WITH_BASIC_INCLUDE;
}>;

export type InvitationWithDashboard = Prisma.DashboardInvitationGetPayload<{
  include: typeof INVITATION_WITH_DASHBOARD_INCLUDE;
}>;
