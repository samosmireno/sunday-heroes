import { User, Role, Prisma } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";
import { USER_WITH_DASHBOARD_INCLUDE, UserWithDashboard } from "./types";

export class UserRepo {
  static async findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<User | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.findUnique({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "UserRepo.findById");
    }
  }

  static async findDashboardIdById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<string | null> {
    try {
      const prismaClient = tx || prisma;
      const user = await prismaClient.user.findUnique({
        where: { id },
        include: {
          dashboard: {
            select: {
              id: true,
            },
          },
        },
      });

      return user?.dashboard?.id || null;
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "UserRepo.findById");
    }
  }

  static async findByIdWithDashboard(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithDashboard | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.findUnique({
        where: { id },
        include: USER_WITH_DASHBOARD_INCLUDE,
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "UserRepo.findByIdWithDashboard");
    }
  }

  static async findByEmail(
    email: string,
    tx?: Prisma.TransactionClient
  ): Promise<User | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.findUnique({ where: { email } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "UserRepo.findByEmail");
    }
  }

  static async findAll(tx?: Prisma.TransactionClient): Promise<User[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "UserRepo.findAll");
    }
  }

  static async findByRole(
    role: Role,
    tx?: Prisma.TransactionClient
  ): Promise<User[]> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.findMany({
        where: { role },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "UserRepo.findByRole");
    }
  }

  static async findByResetToken(token: string) {
    return await prisma.user.findFirst({
      where: { resetToken: token },
    });
  }

  static async getUserRole(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<Role | null> {
    try {
      const prismaClient = tx || prisma;
      const user = await prismaClient.user.findUnique({
        where: { id },
        select: { role: true },
      });
      return user?.role || null;
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "UserRepo.getUserRole");
    }
  }

  static async getDashboardId(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<string | null> {
    try {
      const prismaClient = tx || prisma;
      const user = await prismaClient.user.findUnique({
        where: { id },
        select: {
          dashboard: {
            select: { id: true },
          },
        },
      });
      return user?.dashboard?.id || null;
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "UserRepo.getDashboardId");
    }
  }

  static async create(
    data: Omit<User, "id">,
    tx?: Prisma.TransactionClient
  ): Promise<User> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.create({ data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "UserRepo.create");
    }
  }

  static async update(
    id: string,
    data: Partial<User>,
    tx?: Prisma.TransactionClient
  ): Promise<User> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.update({ where: { id }, data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "UserRepo.update");
    }
  }

  static async delete(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<User> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.user.delete({ where: { id } });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "UserRepo.delete");
    }
  }
}
