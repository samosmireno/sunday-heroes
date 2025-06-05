import { Prisma } from "@prisma/client";
import prisma from "./prisma-client";

export type InvitationWithDetails = Prisma.DashboardInvitationGetPayload<{
  include: {
    invited_by: true;
    dashboard_player: {
      include: {
        dashboard: true;
      };
    };
  };
}>;

export class InvitationRepo {
  static async createInvitation(data: {
    invited_by_id: string;
    dashboard_player_id: string;
    invite_token: string;
    email?: string;
    expires_at: Date;
  }) {
    return prisma.dashboardInvitation.create({ data });
  }

  static async findInvitationByToken(token: string) {
    return prisma.dashboardInvitation.findUnique({
      where: { invite_token: token },
      include: {
        invited_by: true,
        dashboard_player: {
          include: {
            dashboard: true,
          },
        },
      },
    });
  }

  static async findActiveInvitationByPlayer(dashboardPlayerId: string) {
    return prisma.dashboardInvitation.findFirst({
      where: {
        dashboard_player_id: dashboardPlayerId,
        expires_at: { gt: new Date() },
        used_at: null,
      },
    });
  }

  static async findActiveInvitationByEmail(email: string) {
    return prisma.dashboardInvitation.findFirst({
      where: {
        email,
        expires_at: { gt: new Date() },
        used_at: null,
      },
    });
  }

  static async markInvitationAsUsed(token: string, userId: string) {
    return prisma.dashboardInvitation.update({
      where: { invite_token: token },
      data: {
        used_at: new Date(),
        used_by_user_id: userId,
      },
    });
  }

  static async deleteInvitation(id: string) {
    return prisma.dashboardInvitation.delete({
      where: { id },
    });
  }

  static async findInvitationsByDashboard(dashboardId: string) {
    return prisma.dashboardInvitation.findMany({
      where: {
        dashboard_player: {
          dashboard_id: dashboardId,
        },
      },
      include: {
        invited_by: {
          select: {
            given_name: true,
            family_name: true,
            email: true,
          },
        },
        dashboard_player: {
          select: {
            nickname: true,
          },
        },
        used_by_user: {
          select: {
            given_name: true,
            family_name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }

  static async findInvitationsByUser(userId: string) {
    return prisma.dashboardInvitation.findMany({
      where: { invited_by_id: userId },
      include: {
        dashboard_player: {
          include: {
            dashboard: {
              select: {
                name: true,
              },
            },
          },
        },
        used_by_user: {
          select: {
            given_name: true,
            family_name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }

  static async executeInvitationAcceptance(
    token: string,
    userId: string,
    playerId: string
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.dashboardInvitation.update({
        where: { invite_token: token },
        data: {
          used_at: new Date(),
          used_by_user_id: userId,
        },
      });

      await tx.dashboardPlayer.update({
        where: { id: playerId },
        data: {
          user_id: userId,
        },
      });
    });
  }
}
