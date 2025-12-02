import { DashboardPlayerRepo } from "../repositories/dashboard-player/dashboard-player-repo";
import { DashboardPlayerService } from "./dashboard-player-service";
import { EmailService } from "./email-service";
import { AuthService } from "./auth-service";
import crypto from "crypto";
import prisma from "../repositories/prisma-client";
import { Response } from "express";
import { config } from "../config/config";
import { User } from "@prisma/client";
import { DashboardRepo } from "../repositories/dashboard/dashboard-repo";
import {
  AuthorizationError,
  ConflictError,
  InvitationError,
  NotFoundError,
} from "../utils/errors";
import { InvitationResponse } from "@repo/shared-types";
import { InvitationRepo } from "../repositories/invitation/invitation-repo";
import {
  InvitationWithDashboard,
  InvitationWithDetails,
} from "../repositories/invitation/types";

export interface CreateInvitationData {
  invitedById: string;
  dashboardPlayerId: string;
  email?: string;
  expirationHours?: number;
}

export class InvitationService {
  private static readonly DEFAULT_EXPIRATION_HOURS = 168; // 7 days

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
  ): Promise<InvitationResponse | null> {
    const invitation = await InvitationRepo.findByToken(token);

    if (!invitation || invitation.usedAt || invitation.expiresAt < new Date()) {
      return null;
    }

    return this.mapToInvitationResponse(invitation);
  }

  static async acceptInvitation(token: string, userId: string): Promise<void> {
    const invitation = await this.validateInvitation(token);
    if (!invitation) {
      throw new InvitationError("Invalid or expired invitation token");
    }

    await this.validateUserEligibility(userId, invitation);

    await this.executeInvitationAcceptance(
      token,
      userId,
      invitation.dashboardPlayer.id
    );
  }

  static async getInvitationsByDashboard(
    dashboardId: string,
    requestingUserId: string
  ) {
    const canAccess = await this.canUserAccessDashboard(
      dashboardId,
      requestingUserId
    );
    if (!canAccess) {
      throw new AuthorizationError(
        "User is not authorized to access this dashboard"
      );
    }

    return await InvitationRepo.findByDashboardId(dashboardId);
  }

  static async getInvitationsByUser(
    userId: string
  ): Promise<InvitationWithDashboard[]> {
    return await InvitationRepo.findByUserId(userId);
  }

  static async deleteInvitation(
    invitationId: string,
    requestingUserId: string
  ): Promise<void> {
    const invitation = await InvitationRepo.findByIdWithDetails(invitationId);
    if (!invitation) {
      throw new NotFoundError("Invitation");
    }

    const canDelete = await this.canUserDeleteInvitation(
      invitation,
      requestingUserId
    );
    if (!canDelete) {
      throw new AuthorizationError(
        "User is not authorized to delete this invitation"
      );
    }

    await InvitationRepo.delete(invitationId);
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
      const encodedUser = encodeURIComponent(
        AuthService.encodeUserInfo(userInfo)
      );

      return res.redirect(
        `${config.google.redirectClientUrl}?user=${encodedUser}&invitation=accepted&dashboard=${invitation.dashboardPlayer.dashboard.id}`
      );
    } catch (error) {
      throw new InvitationError("Failed to handle invitation");
    }
  }

  private static async validateCreatePermissions(
    dashboardPlayerId: string,
    invitedById: string
  ) {
    const dashboardPlayer =
      await DashboardPlayerRepo.findByIdWithAdmin(dashboardPlayerId);

    if (!dashboardPlayer) {
      throw new NotFoundError("Dashboard player");
    }

    if (dashboardPlayer.dashboard.adminId !== invitedById) {
      throw new AuthorizationError(
        "Only dashboard admin can create invitations"
      );
    }

    if (dashboardPlayer.userId) {
      throw new ConflictError(
        "Dashboard player already has a user associated with it"
      );
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
      return existingInvitations[0].inviteToken;
    }

    if (email) {
      const existingEmailInvitations = await InvitationRepo.findByEmail(email, {
        activeOnly: true,
      });
      if (existingEmailInvitations.length > 0) {
        throw new ConflictError("An invitation with this email already exists");
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

    const inviteToken = this.generateInviteToken();
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

    await InvitationRepo.create({
      invitedById,
      dashboardPlayerId,
      inviteToken,
      email,
      expiresAt,
    });

    if (email) {
      await this.sendInvitationEmail(email, inviteToken, dashboardPlayer);
    }

    return inviteToken;
  }

  private static async sendInvitationEmail(
    email: string,
    token: string,
    dashboardPlayer: any
  ) {
    await EmailService.sendDashboardInvitation(email, token, {
      dashboardName: dashboardPlayer.dashboard.name,
      playerNickname: dashboardPlayer.nickname,
      inviterName: `${dashboardPlayer.dashboard.admin.givenName} ${dashboardPlayer.dashboard.admin.familyName}`,
    });
  }

  private static async validateUserEligibility(
    userId: string,
    invitation: InvitationResponse
  ) {
    const existingPlayer = await DashboardPlayerService.getPlayerInDashboard(
      invitation.dashboardPlayer.dashboard.id,
      userId
    );

    if (existingPlayer) {
      throw new ConflictError("User already has a player in this dashboard");
    }
  }

  private static async executeInvitationAcceptance(
    token: string,
    userId: string,
    playerId: string
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await InvitationRepo.markAsUsed(token, userId, tx);

      await DashboardPlayerRepo.update(playerId, { userId }, tx);
    });
  }

  private static async canUserAccessDashboard(
    dashboardId: string,
    userId: string
  ): Promise<boolean> {
    const dashboard = await DashboardRepo.findById(dashboardId);
    if (!dashboard) return false;

    if (dashboard.adminId === userId) return true;

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
    return (
      invitation.invitedById === userId ||
      invitation.dashboardPlayer.dashboard.adminId === userId
    );
  }

  private static mapToInvitationResponse(
    invitation: InvitationWithDetails
  ): InvitationResponse {
    return {
      id: invitation.id,
      token: invitation.inviteToken,
      dashboardPlayer: {
        id: invitation.dashboardPlayer.id,
        nickname: invitation.dashboardPlayer.nickname,
        dashboard: {
          id: invitation.dashboardPlayer.dashboard.id,
          name: invitation.dashboardPlayer.dashboard.name,
        },
      },
      invitedBy: {
        name: `${invitation.invitedBy.givenName} ${invitation.invitedBy.familyName}`,
        email: invitation.invitedBy.email,
      },
      expiresAt: invitation.expiresAt,
    };
  }
}
