import { User, Role, Prisma } from "@prisma/client";
import prisma from "./prisma-client";

export class UserRepo {
  static async getAllUsers(): Promise<User[]> {
    return prisma.user.findMany();
  }

  static async getUserById(
    id: string
  ): Promise<Prisma.UserGetPayload<{ include: { dashboard: true } }> | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { dashboard: true },
    });
  }

  static async getUserRoleById(id: string): Promise<Role | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? user.role : null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  static async getDashboardIdFromUserId(
    userId: string
  ): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { dashboard: true },
    });
    return user && user.dashboard && user.dashboard.id
      ? user.dashboard.id
      : null;
  }

  static async getAdmins(): Promise<User[]> {
    return prisma.user.findMany({ where: { role: "ADMIN" } });
  }

  static async getModerators(): Promise<User[]> {
    return prisma.user.findMany({ where: { role: "MODERATOR" } });
  }

  static async createUser(data: Omit<User, "id">): Promise<User> {
    return prisma.user.create({ data });
  }

  static async updateUser(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  static async deleteUser(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }
}
