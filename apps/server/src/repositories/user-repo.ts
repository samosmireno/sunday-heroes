import { User, Role } from "@prisma/client";
import prisma from "./prisma-client";

export class UserRepo {
  static async getAllUsers(): Promise<User[]> {
    return prisma.user.findMany();
  }

  static async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  static async getUserRoleById(id: string): Promise<Role | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? user.role : null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  static async getUserByNickname(nickname: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { nickname } });
  }

  static async getUserIdByNickname(nickname: string): Promise<string | null> {
    const user = await prisma.user.findUnique({ where: { nickname } });
    return user ? user.id : null;
  }

  static async getUsersByQuery(query: string): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        nickname: {
          startsWith: query,
          mode: "insensitive",
        },
      },
    });
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

  static async addMissingUsers(playerNames: string[]): Promise<void> {
    for (const playerName of playerNames) {
      const existingPlayer = await prisma.user.findFirst({
        where: { nickname: { equals: playerName, mode: "insensitive" } },
      });

      if (!existingPlayer) {
        await prisma.user.create({
          data: { nickname: playerName },
        });
      }
    }
  }

  static async deleteUser(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }

  static async deleteUsersWithNoMatches(): Promise<void> {
    await prisma.user.deleteMany({
      where: {
        match_players: {
          none: {},
        },
      },
    });
  }

  static async isAdmin(nickname: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { nickname } });
    return user?.role === "ADMIN";
  }
}
