import {
  InvitationRepo,
  InvitationWithDetails,
  InvitationWithBasic,
  InvitationWithDashboard,
} from "../repositories/invitation-repo";
import { DashboardPlayerRepo } from "../repositories/dashboard-player-repo";
import { DashboardPlayerService } from "./dashboard-player-service";
import { EmailService } from "./email-service";
import { AuthService } from "./auth-service";
import crypto from "crypto";
import prisma from "../repositories/prisma-client";
import { Response } from "express";
import { config } from "../config/config";
import { User } from "@prisma/client";
import { DashboardRepo } from "../repositories/dashboard-repo";

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
  private static readonly DEFAULT_EXPIRATION_HOURS = 168; // 7 days

  static generateInviteToken(): string {
    return crypto.randomBytes(8).toString("hex");
  }

  // Business logic: Create invitation with validation
  static async createInvitation(data: CreateInvitationData): Promise<string> {
    const {
      invitedById,
      dashboardPlayerId,
      email,
      expirationHours = this.DEFAULT_EXPIRATION_HOURS,
    } = data;

    // Validate permissions
    const dashboardPlayer = await this.validateCreatePermissions(
      dashboardPlayerId,
      invitedById
    );

    // Handle existing invitations
    const existingToken = await this.handleExistingInvitations(
      dashboardPlayerId,
      email
    );
    if (existingToken) return existingToken;

    // Create new invitation
    return await this.createNewInvitation({
      invitedById,
      dashboardPlayerId,
      email,
      expirationHours,
      dashboardPlayer: dashboardPlayer!,
    });
  }

  // Business logic: Validate invitation
  static async validateInvitation(
    token: string
  ): Promise<InvitationDetails | null> {
    const invitation = await InvitationRepo.findByToken(token);

    if (
      !invitation ||
      invitation.used_at ||
      invitation.expires_at < new Date()
    ) {
      return null;
    }

    return this.mapToInvitationDetails(invitation);
  }

  // Business logic: Accept invitation with validation and transaction
  static async acceptInvitation(token: string, userId: string): Promise<void> {
    const invitation = await this.validateInvitation(token);
    if (!invitation) {
      throw new Error("Invalid or expired invitation");
    }

    await this.validateUserEligibility(userId, invitation);

    // Execute acceptance in transaction (this is business logic orchestration)
    await this.executeInvitationAcceptance(
      token,
      userId,
      invitation.dashboardPlayer.id
    );
  }

  // Business logic: Get invitations for dashboard with authorization
  static async getInvitationsByDashboard(
    dashboardId: string,
    requestingUserId: string
  ) {
    // Check if user can access this dashboard
    const canAccess = await this.canUserAccessDashboard(
      dashboardId,
      requestingUserId
    );
    if (!canAccess) {
      throw new Error("Not authorized to view invitations for this dashboard");
    }

    return await InvitationRepo.findByDashboardId(dashboardId);
  }

  // Business logic: Get invitations by user
  static async getInvitationsByUser(
    userId: string
  ): Promise<InvitationWithDashboard[]> {
    return await InvitationRepo.findByUserId(userId);
  }

  // Business logic: Delete invitation with authorization
  static async deleteInvitation(
    invitationId: string,
    requestingUserId: string
  ): Promise<void> {
    const invitation = await InvitationRepo.findByIdWithDetails(invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Check if user can delete this invitation
    const canDelete = await this.canUserDeleteInvitation(
      invitation,
      requestingUserId
    );
    if (!canDelete) {
      throw new Error("Not authorized to delete this invitation");
    }

    await InvitationRepo.delete(invitationId);
  }

  // Business logic: Handle invitation flow (OAuth callback)
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

  // Private business logic methods
  private static async validateCreatePermissions(
    dashboardPlayerId: string,
    invitedById: string
  ) {
    const dashboardPlayer =
      await DashboardPlayerRepo.findByIdWithAdmin(dashboardPlayerId);

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
    const existingInvitations = await InvitationRepo.findByDashboardPlayerId(
      dashboardPlayerId,
      { activeOnly: true }
    );

    if (existingInvitations.length > 0) {
      return existingInvitations[0].invite_token;
    }

    if (email) {
      const existingEmailInvitations = await InvitationRepo.findByEmail(email, {
        activeOnly: true,
      });
      if (existingEmailInvitations.length > 0) {
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
    dashboardPlayer: any;
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

    await InvitationRepo.create({
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
    dashboardPlayer: any
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
    const existingPlayer = await DashboardPlayerService.getPlayerInDashboard(
      invitation.dashboardPlayer.dashboard.id,
      userId
    );

    if (existingPlayer) {
      throw new Error("User already has a player in this dashboard");
    }
  }

  // Business logic: Execute invitation acceptance (orchestrates multiple entities)
  private static async executeInvitationAcceptance(
    token: string,
    userId: string,
    playerId: string
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Mark invitation as used
      await InvitationRepo.markAsUsed(token, userId, tx);

      // Link user to dashboard player
      await DashboardPlayerRepo.update(playerId, { user_id: userId }, tx);
    });
  }

  private static async canUserAccessDashboard(
    dashboardId: string,
    userId: string
  ): Promise<boolean> {
    // Check if user is dashboard admin or has a player in the dashboard
    const dashboard = await DashboardRepo.findById(dashboardId);
    if (!dashboard) return false;

    if (dashboard.admin_id === userId) return true;

    const player = await DashboardPlayerService.getPlayerInDashboard(
      dashboardId,
      userId
    );
    return player !== null;
  }

  private static async canUserDeleteInvitation(
    invitation: InvitationWithDetails,
    userId: string
  ): Promise<boolean> {
    // User can delete if they created it or are dashboard admin
    return (
      invitation.invited_by_id === userId ||
      invitation.dashboard_player.dashboard.admin_id === userId
    );
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
