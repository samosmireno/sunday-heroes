import { DashboardInvitation, Prisma } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";
import {
  INVITATION_WITH_BASIC_INCLUDE,
  INVITATION_WITH_DASHBOARD_INCLUDE,
  INVITATION_WITH_DETAILS_INCLUDE,
  InvitationWithBasic,
  InvitationWithDashboard,
  InvitationWithDetails,
} from "./types";

export class InvitationRepo {
  static async findById(
    id: string,
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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

  static async findAll(
    tx?: Prisma.TransactionClient
  ): Promise<DashboardInvitation[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "InvitationRepo.findAll");
    }
  }

  static async findByToken(
    inviteToken: string,
    tx?: Prisma.TransactionClient
  ): Promise<InvitationWithDetails | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.findUnique({
        where: { inviteToken },
        include: INVITATION_WITH_DETAILS_INCLUDE,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "InvitationRepo.findByToken");
    }
  }

  static async findByDashboardPlayerId(
    dashboardPlayerId: string,
    options?: { activeOnly?: boolean },
    tx?: Prisma.TransactionClient
  ): Promise<DashboardInvitation[]> {
    try {
      const prismaClient = tx || prisma;
      const whereClause: Prisma.DashboardInvitationWhereInput = {
        dashboardPlayerId,
      };

      if (options?.activeOnly) {
        whereClause.expiresAt = { gt: new Date() };
        whereClause.usedAt = null;
      }

      return await prismaClient.dashboardInvitation.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
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
    tx?: Prisma.TransactionClient
  ): Promise<DashboardInvitation[]> {
    try {
      const prismaClient = tx || prisma;
      const whereClause: Prisma.DashboardInvitationWhereInput = {
        email,
      };

      if (options?.activeOnly) {
        whereClause.expiresAt = { gt: new Date() };
        whereClause.usedAt = null;
      }

      return await prismaClient.dashboardInvitation.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "InvitationRepo.findByEmail");
    }
  }

  static async findByDashboardId(
    dashboardId: string,
    tx?: Prisma.TransactionClient
  ): Promise<InvitationWithBasic[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.findMany({
        where: {
          dashboardPlayer: {
            dashboardId,
          },
        },
        include: INVITATION_WITH_BASIC_INCLUDE,
        orderBy: { createdAt: "desc" },
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
    tx?: Prisma.TransactionClient
  ): Promise<InvitationWithDashboard[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.findMany({
        where: { invitedById: userId },
        include: INVITATION_WITH_DASHBOARD_INCLUDE,
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "InvitationRepo.findByUserId");
    }
  }

  static async countByDashboardId(
    dashboardId: string,
    tx?: Prisma.TransactionClient
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.count({
        where: {
          dashboardPlayer: {
            dashboardId,
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
    tx?: Prisma.TransactionClient
  ): Promise<number> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.count({
        where: { invitedById: userId },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "InvitationRepo.countByUserId");
    }
  }

  static async isTokenActive(
    inviteToken: string,
    tx?: Prisma.TransactionClient
  ): Promise<boolean> {
    try {
      const prismaClient = tx || prisma;
      const invitation = await prismaClient.dashboardInvitation.findUnique({
        where: { inviteToken },
        select: {
          expiresAt: true,
          usedAt: true,
        },
      });

      if (!invitation) return false;
      return invitation.usedAt === null && invitation.expiresAt > new Date();
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "InvitationRepo.isTokenActive");
    }
  }

  static async create(
    data: {
      invitedById: string;
      dashboardPlayerId: string;
      inviteToken: string;
      email?: string;
      expiresAt: Date;
    },
    tx?: Prisma.TransactionClient
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
    tx?: Prisma.TransactionClient
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
    inviteToken: string,
    data: Partial<DashboardInvitation>,
    tx?: Prisma.TransactionClient
  ): Promise<DashboardInvitation> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.update({
        where: { inviteToken },
        data,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "InvitationRepo.updateByToken");
    }
  }

  static async delete(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<DashboardInvitation> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.delete({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "InvitationRepo.delete");
    }
  }

  static async deleteByToken(
    inviteToken: string,
    tx?: Prisma.TransactionClient
  ): Promise<DashboardInvitation> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.delete({
        where: { inviteToken },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "InvitationRepo.deleteByToken");
    }
  }

  static async markAsUsed(
    inviteToken: string,
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<DashboardInvitation> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.dashboardInvitation.update({
        where: { inviteToken },
        data: {
          usedAt: new Date(),
          usedByUserId: userId,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "InvitationRepo.markAsUsed");
    }
  }
}
