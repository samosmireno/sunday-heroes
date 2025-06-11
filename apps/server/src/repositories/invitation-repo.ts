import { DashboardInvitation, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";

// Define reusable include patterns (DRY principle)
const INVITATION_WITH_DETAILS_INCLUDE = {
  invited_by: true,
  dashboard_player: {
    include: {
      dashboard: true,
    },
  },
} satisfies Prisma.DashboardInvitationInclude;

const INVITATION_WITH_BASIC_INCLUDE = {
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
} satisfies Prisma.DashboardInvitationInclude;

const INVITATION_WITH_DASHBOARD_INCLUDE = {
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
} satisfies Prisma.DashboardInvitationInclude;

// Type definitions using the includes
export type InvitationWithDetails = Prisma.DashboardInvitationGetPayload<{
  include: typeof INVITATION_WITH_DETAILS_INCLUDE;
}>;

export type InvitationWithBasic = Prisma.DashboardInvitationGetPayload<{
  include: typeof INVITATION_WITH_BASIC_INCLUDE;
}>;

export type InvitationWithDashboard = Prisma.DashboardInvitationGetPayload<{
  include: typeof INVITATION_WITH_DASHBOARD_INCLUDE;
}>;

export class InvitationRepo {
  // BASIC CRUD OPERATIONS
  static async findById(
    id: string,
    tx?: PrismaTransaction
  ): Promise<DashboardInvitation | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error("Error in InvitationRepo.findById:", error);
      throw new Error("Failed to fetch invitation");
    }
  }

  static async findByIdWithDetails(
    id: string,
    tx?: PrismaTransaction
  ): Promise<InvitationWithDetails | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.findUnique({
        where: { id },
        include: INVITATION_WITH_DETAILS_INCLUDE,
      });
    } catch (error) {
      console.error("Error in InvitationRepo.findByIdWithDetails:", error);
      throw new Error("Failed to fetch invitation with details");
    }
  }

  // SIMPLE FILTERED QUERIES (Repository responsibility)
  static async findAll(tx?: PrismaTransaction): Promise<DashboardInvitation[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.findMany({
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error in InvitationRepo.findAll:", error);
      throw new Error("Failed to fetch invitations");
    }
  }

  static async findByToken(
    token: string,
    tx?: PrismaTransaction
  ): Promise<InvitationWithDetails | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.findUnique({
        where: { invite_token: token },
        include: INVITATION_WITH_DETAILS_INCLUDE,
      });
    } catch (error) {
      console.error("Error in InvitationRepo.findByToken:", error);
      throw new Error("Failed to fetch invitation by token");
    }
  }

  static async findByDashboardPlayerId(
    dashboardPlayerId: string,
    options?: { activeOnly?: boolean },
    tx?: PrismaTransaction
  ): Promise<DashboardInvitation[]> {
    try {
      const prismaClient = tx || prisma;
      const whereClause: Prisma.DashboardInvitationWhereInput = {
        dashboard_player_id: dashboardPlayerId,
      };

      if (options?.activeOnly) {
        whereClause.expires_at = { gt: new Date() };
        whereClause.used_at = null;
      }

      return await prismaClient.dashboardInvitation.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error in InvitationRepo.findByDashboardPlayerId:", error);
      throw new Error("Failed to fetch invitations by dashboard player");
    }
  }

  static async findByEmail(
    email: string,
    options?: { activeOnly?: boolean },
    tx?: PrismaTransaction
  ): Promise<DashboardInvitation[]> {
    try {
      const prismaClient = tx || prisma;
      const whereClause: Prisma.DashboardInvitationWhereInput = {
        email,
      };

      if (options?.activeOnly) {
        whereClause.expires_at = { gt: new Date() };
        whereClause.used_at = null;
      }

      return await prismaClient.dashboardInvitation.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error in InvitationRepo.findByEmail:", error);
      throw new Error("Failed to fetch invitations by email");
    }
  }

  static async findByDashboardId(
    dashboardId: string,
    tx?: PrismaTransaction
  ): Promise<InvitationWithBasic[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.findMany({
        where: {
          dashboard_player: {
            dashboard_id: dashboardId,
          },
        },
        include: INVITATION_WITH_BASIC_INCLUDE,
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error in InvitationRepo.findByDashboardId:", error);
      throw new Error("Failed to fetch invitations by dashboard");
    }
  }

  static async findByUserId(
    userId: string,
    tx?: PrismaTransaction
  ): Promise<InvitationWithDashboard[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.findMany({
        where: { invited_by_id: userId },
        include: INVITATION_WITH_DASHBOARD_INCLUDE,
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error in InvitationRepo.findByUserId:", error);
      throw new Error("Failed to fetch invitations by user");
    }
  }

  // Simple count operations
  static async countByDashboardId(
    dashboardId: string,
    tx?: PrismaTransaction
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.count({
        where: {
          dashboard_player: {
            dashboard_id: dashboardId,
          },
        },
      });
    } catch (error) {
      console.error("Error in InvitationRepo.countByDashboardId:", error);
      throw new Error("Failed to count invitations by dashboard");
    }
  }

  static async countByUserId(
    userId: string,
    tx?: PrismaTransaction
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.count({
        where: { invited_by_id: userId },
      });
    } catch (error) {
      console.error("Error in InvitationRepo.countByUserId:", error);
      throw new Error("Failed to count invitations by user");
    }
  }

  // Simple attribute getters
  static async isTokenActive(
    token: string,
    tx?: PrismaTransaction
  ): Promise<boolean> {
    try {
      const prismaClient = tx || prisma;
      const invitation = await prismaClient.dashboardInvitation.findUnique({
        where: { invite_token: token },
        select: {
          expires_at: true,
          used_at: true,
        },
      });

      if (!invitation) return false;
      return invitation.used_at === null && invitation.expires_at > new Date();
    } catch (error) {
      console.error("Error in InvitationRepo.isTokenActive:", error);
      throw new Error("Failed to check if token is active");
    }
  }

  // CREATE/UPDATE/DELETE OPERATIONS
  static async create(
    data: {
      invited_by_id: string;
      dashboard_player_id: string;
      invite_token: string;
      email?: string;
      expires_at: Date;
    },
    tx?: PrismaTransaction
  ): Promise<DashboardInvitation> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.create({ data });
    } catch (error) {
      console.error("Error in InvitationRepo.create:", error);
      throw new Error("Failed to create invitation");
    }
  }

  static async update(
    id: string,
    data: Partial<DashboardInvitation>,
    tx?: PrismaTransaction
  ): Promise<DashboardInvitation> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error("Error in InvitationRepo.update:", error);
      throw new Error("Failed to update invitation");
    }
  }

  static async updateByToken(
    token: string,
    data: Partial<DashboardInvitation>,
    tx?: PrismaTransaction
  ): Promise<DashboardInvitation> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.update({
        where: { invite_token: token },
        data,
      });
    } catch (error) {
      console.error("Error in InvitationRepo.updateByToken:", error);
      throw new Error("Failed to update invitation by token");
    }
  }

  static async delete(
    id: string,
    tx?: PrismaTransaction
  ): Promise<DashboardInvitation> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.delete({ where: { id } });
    } catch (error) {
      console.error("Error in InvitationRepo.delete:", error);
      throw new Error("Failed to delete invitation");
    }
  }

  static async deleteByToken(
    token: string,
    tx?: PrismaTransaction
  ): Promise<DashboardInvitation> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.delete({
        where: { invite_token: token },
      });
    } catch (error) {
      console.error("Error in InvitationRepo.deleteByToken:", error);
      throw new Error("Failed to delete invitation by token");
    }
  }

  // Simple mark as used operation (single entity operation)
  static async markAsUsed(
    token: string,
    userId: string,
    tx?: PrismaTransaction
  ): Promise<DashboardInvitation> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.update({
        where: { invite_token: token },
        data: {
          used_at: new Date(),
          used_by_user_id: userId,
        },
      });
    } catch (error) {
      console.error("Error in InvitationRepo.markAsUsed:", error);
      throw new Error("Failed to mark invitation as used");
    }
  }
}
