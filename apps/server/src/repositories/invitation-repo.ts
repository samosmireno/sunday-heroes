import { DashboardInvitation, Prisma } from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";
import { PrismaErrorHandler } from "../utils/prisma-error-handler";

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
      throw PrismaErrorHandler.handle(error, "InvitationRepo.findById");
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
      throw PrismaErrorHandler.handle(
        error,
        "InvitationRepo.findByIdWithDetails"
      );
    }
  }

  static async findAll(tx?: PrismaTransaction): Promise<DashboardInvitation[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.findMany({
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "InvitationRepo.findAll");
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
      throw PrismaErrorHandler.handle(error, "InvitationRepo.findByToken");
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
      throw PrismaErrorHandler.handle(
        error,
        "InvitationRepo.findByDashboardPlayerId"
      );
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
      throw PrismaErrorHandler.handle(error, "InvitationRepo.findByEmail");
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
      throw PrismaErrorHandler.handle(
        error,
        "InvitationRepo.findByDashboardId"
      );
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
      throw PrismaErrorHandler.handle(error, "InvitationRepo.findByUserId");
    }
  }

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
      throw PrismaErrorHandler.handle(
        error,
        "InvitationRepo.countByDashboardId"
      );
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
      throw PrismaErrorHandler.handle(error, "InvitationRepo.countByUserId");
    }
  }

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
      throw PrismaErrorHandler.handle(error, "InvitationRepo.isTokenActive");
    }
  }

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
      throw PrismaErrorHandler.handle(error, "InvitationRepo.create");
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
      throw PrismaErrorHandler.handle(error, "InvitationRepo.update");
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
      throw PrismaErrorHandler.handle(error, "InvitationRepo.updateByToken");
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
      throw PrismaErrorHandler.handle(error, "InvitationRepo.delete");
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
      throw PrismaErrorHandler.handle(error, "InvitationRepo.deleteByToken");
    }
  }

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
      throw PrismaErrorHandler.handle(error, "InvitationRepo.markAsUsed");
    }
  }
}
