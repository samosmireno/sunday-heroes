import { Role, User } from "@prisma/client";
import { UserRepo, UserWithDashboard } from "../repositories/user-repo";

export class UserService {
  static async getUserById(id: string) {
    const user = await UserRepo.findByIdWithDashboard(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  static async getUserByEmail(email: string) {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email format");
    }

    const user = await UserRepo.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  static async getAllUsers(options: { role?: Role } = {}) {
    const { role } = options;

    if (role) {
      return await UserRepo.findByRole(role);
    }

    return await UserRepo.findAll();
  }

  static async createUser(data: {
    email: string;
    given_name: string;
    family_name: string;
    role?: Role;
  }) {
    const existingUser = await UserRepo.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    return await UserRepo.create({
      ...data,
      role: data.role || "PLAYER",
      is_registered: false,
      created_at: new Date(),
      last_login: null,
    });
  }

  static async updateUser(
    id: string,
    requestingUserId: string,
    data: Partial<User>
  ) {
    const user = await UserRepo.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    const requestingUser = await UserRepo.findById(requestingUserId);
    if (!requestingUser) {
      throw new Error("Requesting user not found");
    }

    const canUpdate =
      id === requestingUserId || requestingUser.role === "ADMIN";
    if (!canUpdate) {
      throw new Error("Not authorized to update this user");
    }

    if (data.role && requestingUser.role !== "ADMIN") {
      throw new Error("Only admins can change user roles");
    }

    return await UserRepo.update(id, data);
  }

  static async deleteUser(id: string, requestingUserId: string) {
    const user = await UserRepo.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    const requestingUser = await UserRepo.findById(requestingUserId);
    if (!requestingUser) {
      throw new Error("Requesting user not found");
    }

    if (requestingUser.role !== "ADMIN") {
      throw new Error("Only admins can delete users");
    }

    return await UserRepo.delete(id);
  }

  static async getDashboardIdFromUserId(userId: string): Promise<string> {
    const dashboardId = await UserRepo.getDashboardId(userId);
    if (!dashboardId) {
      throw new Error(`No dashboard found for user ${userId}`);
    }
    return dashboardId;
  }

  static async hasUserDashboardAccess(userId: string): Promise<boolean> {
    const dashboardId = await UserRepo.getDashboardId(userId);
    return dashboardId !== null;
  }

  static async isUserAdmin(userId: string): Promise<boolean> {
    const role = await UserRepo.getUserRole(userId);
    return role === "ADMIN";
  }

  static async isUserModerator(userId: string): Promise<boolean> {
    const role = await UserRepo.getUserRole(userId);
    return role === "MODERATOR";
  }

  static async isUserAdminOrModerator(userId: string): Promise<boolean> {
    const role = await UserRepo.getUserRole(userId);
    return role === "ADMIN" || role === "MODERATOR";
  }

  static async getAdmins() {
    return await UserRepo.findByRole("ADMIN");
  }

  static async getModerators() {
    return await UserRepo.findByRole("MODERATOR");
  }

  static async getRegularUsers() {
    return await UserRepo.findByRole("PLAYER");
  }
}
