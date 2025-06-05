import {
  InvitationRepo,
  InvitationWithDetails,
} from "../repositories/invitation-repo";
import crypto from "crypto";
import { EmailService } from "./email-service";
import { AuthService } from "./auth-service";
import { Response } from "express";
import { config } from "../config/config";
import {
  DashboardPlayerRepo,
  DashboardPlayerWithAdmin,
} from "../repositories/dashboard-player-repo";
import { User } from "@prisma/client";

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
  private static readonly DEFAULT_EXPIRATION_HOURS = 168;

  static generateInviteToken(): string {
    return crypto.randomBytes(8).toString("hex");
  }

  static async createInvitation(data: CreateInvitationData): Promise<string> {
    const {
      invitedById,
      dashboardPlayerId,
      email,
      expirationHours = this.DEFAULT_EXPIRATION_HOURS,
    } = data;

    const dashboardPlayer = await this.validateCreatePermissions(
      dashboardPlayerId,
      invitedById
    );

    const existingToken = await this.handleExistingInvitations(
      dashboardPlayerId,
      email
    );
    if (existingToken) return existingToken;

    return await this.createNewInvitation({
      invitedById,
      dashboardPlayerId,
      email,
      expirationHours,
      dashboardPlayer: dashboardPlayer!,
    });
  }

  static async validateInvitation(
    token: string
  ): Promise<InvitationDetails | null> {
    const invitation = await InvitationRepo.findInvitationByToken(token);

    if (
      !invitation ||
      invitation.used_at ||
      invitation.expires_at < new Date()
    ) {
      return null;
    }

    return this.mapToInvitationDetails(invitation);
  }

  static async acceptInvitation(token: string, userId: string): Promise<void> {
    const invitation = await this.validateInvitation(token);
    if (!invitation) {
      throw new Error("Invalid or expired invitation");
    }

    await this.validateUserEligibility(userId, invitation);
    await InvitationRepo.executeInvitationAcceptance(
      token,
      userId,
      invitation.dashboardPlayer.id
    );
  }

  static async getInvitationsByDashboard(dashboardId: string) {
    return InvitationRepo.findInvitationsByDashboard(dashboardId);
  }

  static async getInvitationsByUser(userId: string) {
    return InvitationRepo.findInvitationsByUser(userId);
  }

  private static async validateCreatePermissions(
    dashboardPlayerId: string,
    invitedById: string
  ): Promise<DashboardPlayerWithAdmin | null> {
    const dashboardPlayer =
      await DashboardPlayerRepo.getDashboardPlayerByIdWithAdmin(
        dashboardPlayerId
      );

    if (!dashboardPlayer) {
      throw new Error("Dashboard player not found");
    }

    if (dashboardPlayer.dashboard.admin_id !== invitedById) {
      throw new Error("Insufficient permissions to create invitation");
    }

    if (dashboardPlayer.user_id) {
      throw new Error("Dashboard player already has a user assigned");
    }

    return dashboardPlayer;
  }

  private static async handleExistingInvitations(
    dashboardPlayerId: string,
    email?: string
  ): Promise<string | null> {
    const existingInvitation =
      await InvitationRepo.findActiveInvitationByPlayer(dashboardPlayerId);

    if (existingInvitation) {
      return existingInvitation.invite_token;
    }

    if (email) {
      const existingEmailInvitation =
        await InvitationRepo.findActiveInvitationByEmail(email);
      if (existingEmailInvitation) {
        throw new Error("Active invitation already exists for this email");
      }
    }

    return null;
  }

  private static async createNewInvitation(params: {
    invitedById: string;
    dashboardPlayerId: string;
    email?: string;
    expirationHours: number;
    dashboardPlayer: DashboardPlayerWithAdmin;
  }) {
    const {
      invitedById,
      dashboardPlayerId,
      email,
      expirationHours,
      dashboardPlayer,
    } = params;

    const token = this.generateInviteToken();
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

    await InvitationRepo.createInvitation({
      invited_by_id: invitedById,
      dashboard_player_id: dashboardPlayerId,
      invite_token: token,
      email,
      expires_at: expiresAt,
    });

    if (email) {
      await this.sendInvitationEmail(email, token, dashboardPlayer);
    }

    return token;
  }

  private static async sendInvitationEmail(
    email: string,
    token: string,
    dashboardPlayer: DashboardPlayerWithAdmin
  ) {
    await EmailService.sendDashboardInvitation(email, token, {
      dashboardName: dashboardPlayer.dashboard.name,
      playerNickname: dashboardPlayer.nickname,
      inviterName: `${dashboardPlayer.dashboard.admin.given_name} ${dashboardPlayer.dashboard.admin.family_name}`,
    });
  }

  private static async validateUserEligibility(
    userId: string,
    invitation: InvitationDetails
  ) {
    const existingPlayer = await DashboardPlayerRepo.getPlayerInDashboard(
      invitation.dashboardPlayer.dashboard.id,
      userId
    );

    if (existingPlayer) {
      throw new Error("User already has a player in this dashboard");
    }
  }

  private static mapToInvitationDetails(
    invitation: InvitationWithDetails
  ): InvitationDetails {
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

  static async handleInvitation(
    inviteToken: string,
    user: User,
    res: Response
  ) {
    try {
      const invitation = await this.validateInvitation(inviteToken);

      if (!invitation) {
        return res.redirect(
          `${config.google.redirectClientUrl}?error=invalid_invitation`
        );
      }

      await this.acceptInvitation(inviteToken, user.id);
      const userInfo = AuthService.createUserResponse(user);

      return res.redirect(
        `${config.google.redirectClientUrl}?user=${AuthService.encodeUserInfo(userInfo)}&invitation=accepted&dashboard=${invitation.dashboardPlayer.dashboard.id}`
      );
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      return this.handleInvitationError(error, user, res);
    }
  }

  private static handleInvitationError(
    error: unknown,
    user: User,
    res: Response
  ) {
    const userInfo = AuthService.createUserResponse(user);
    const encodedUser = AuthService.encodeUserInfo(userInfo);

    if (
      error instanceof Error &&
      error.message.includes("already has a player")
    ) {
      return res.redirect(
        `${config.google.redirectClientUrl}?error=already_connected&user=${encodedUser}`
      );
    }

    return res.redirect(
      `${config.google.redirectClientUrl}?error=invitation_failed&user=${encodedUser}`
    );
  }
}
