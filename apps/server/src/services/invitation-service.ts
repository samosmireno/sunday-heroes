import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { EmailService } from "./email-service";

const prisma = new PrismaClient();

export interface CreateInvitationData {
  invitedById: string;
  dashboardPlayerId: string;
  email?: string;
  expirationHours?: number;
}

export interface InvitationDetails {
  id: string;
  token: string;
  dashboardPlayer: {
    id: string;
    nickname: string;
    dashboard: {
      id: string;
      name: string;
    };
  };
  invitedBy: {
    name: string;
    email: string;
  };
  expiresAt: Date;
}

export class InvitationService {
  static generateInviteToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static async createInvitation(data: CreateInvitationData): Promise<string> {
    const {
      invitedById,
      dashboardPlayerId,
      email,
      expirationHours = 168,
    } = data;

    const dashboardPlayer = await prisma.dashboardPlayer.findUnique({
      where: { id: dashboardPlayerId },
      include: {
        dashboard: {
          include: {
            admin: true,
          },
        },
      },
    });

    if (!dashboardPlayer) {
      throw new Error("Dashboard player not found");
    }

    if (dashboardPlayer.dashboard.admin_id !== invitedById) {
      throw new Error("Insufficient permissions to create invitation");
    }

    if (dashboardPlayer.user_id) {
      throw new Error("Dashboard player already has a user assigned");
    }

    const existingInvitation = await prisma.dashboardInvitation.findFirst({
      where: {
        dashboard_player_id: dashboardPlayerId,
        expires_at: { gt: new Date() },
        used_at: null,
      },
    });

    if (existingInvitation) {
      if (existingInvitation.expires_at > new Date()) {
        return existingInvitation.invite_token;
      } else {
        await prisma.dashboardInvitation.delete({
          where: { id: existingInvitation.id },
        });
      }
    }

    if (email) {
      const existingEmailInvitation =
        await prisma.dashboardInvitation.findFirst({
          where: {
            email,
            expires_at: { gt: new Date() },
            used_at: null,
          },
        });

      if (existingEmailInvitation) {
        throw new Error("Active invitation already exists for this email");
      }
    }

    const token = this.generateInviteToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    const invitation = await prisma.dashboardInvitation.create({
      data: {
        invited_by_id: invitedById,
        dashboard_player_id: dashboardPlayerId,
        invite_token: token,
        email,
        expires_at: expiresAt,
      },
    });

    if (email) {
      await EmailService.sendDashboardInvitation(email, token, {
        dashboardName: dashboardPlayer.dashboard.name,
        playerNickname: dashboardPlayer.nickname,
        inviterName: `${dashboardPlayer.dashboard.admin.given_name} ${dashboardPlayer.dashboard.admin.family_name}`,
      });
    }

    return token;
  }

  static async validateInvitation(
    token: string
  ): Promise<InvitationDetails | null> {
    const invitation = await prisma.dashboardInvitation.findUnique({
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

    if (!invitation) {
      return null;
    }

    if (invitation.used_at || invitation.expires_at < new Date()) {
      return null;
    }

    return {
      id: invitation.id,
      token: invitation.invite_token,
      dashboardPlayer: {
        id: invitation.dashboard_player.id,
        nickname: invitation.dashboard_player.nickname,
        dashboard: {
          id: invitation.dashboard_player.dashboard.id,
          name: invitation.dashboard_player.dashboard.name,
        },
      },
      invitedBy: {
        name: `${invitation.invited_by.given_name} ${invitation.invited_by.family_name}`,
        email: invitation.invited_by.email,
      },
      expiresAt: invitation.expires_at,
    };
  }

  static async acceptInvitation(token: string, userId: string): Promise<void> {
    const invitation = await this.validateInvitation(token);

    if (!invitation) {
      throw new Error("Invalid or expired invitation");
    }

    const existingPlayer = await prisma.dashboardPlayer.findFirst({
      where: {
        dashboard_id: invitation.dashboardPlayer.dashboard.id,
        user_id: userId,
      },
    });

    if (existingPlayer) {
      throw new Error("User already has a player in this dashboard");
    }

    await prisma.$transaction(async (tx) => {
      await tx.dashboardInvitation.update({
        where: { invite_token: token },
        data: {
          used_at: new Date(),
          used_by_user_id: userId,
        },
      });

      await tx.dashboardPlayer.update({
        where: { id: invitation.dashboardPlayer.id },
        data: {
          user_id: userId,
        },
      });
    });
  }

  static async getInvitationsByDashboard(dashboardId: string) {
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

  static async getInvitationsByUser(userId: string) {
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
}
