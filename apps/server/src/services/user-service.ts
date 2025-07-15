import { Role, User } from "@prisma/client";
import { UserRepo, UserWithDashboard } from "../repositories/user-repo";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";

export class UserService {
  static async getUserById(id: string) {
    const user = await UserRepo.findByIdWithDashboard(id);
    if (!user) {
      throw new NotFoundError("User");
    }
    return user;
  }

  static async getUserByEmail(email: string) {
    if (!email || !email.includes("@")) {
      throw new ValidationError([
        {
          field: "email",
          message: "Invalid email format",
          code: "INVALID_FORMAT",
        },
      ]);
    }

    const user = await UserRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User with this email does not exist");
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
    givenName: string;
    familyName: string;
    role?: Role;
  }) {
    const existingUser = await UserRepo.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError(`User with email ${data.email} already exists`);
    }

    return await UserRepo.create({
      ...data,
      role: data.role || "PLAYER",
      isRegistered: false,
      createdAt: new Date(),
      lastLogin: null,
    });
  }

  static async updateUser(
    id: string,
    requestingUserId: string,
    data: Partial<User>
  ) {
    const user = await UserRepo.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const requestingUser = await UserRepo.findById(requestingUserId);
    if (!requestingUser) {
      throw new NotFoundError("Requesting user");
    }

    const canUpdate =
      id === requestingUserId || requestingUser.role === "ADMIN";
    if (!canUpdate) {
      throw new AuthorizationError(
        "You are not authorized to update this user"
      );
    }

    if (data.role && requestingUser.role !== "ADMIN") {
      throw new AuthorizationError("Only admins can change user roles");
    }

    return await UserRepo.update(id, data);
  }

  static async deleteUser(id: string, requestingUserId: string) {
    const user = await UserRepo.findById(id);
    if (!user) {
      throw new NotFoundError("User");
    }

    const requestingUser = await UserRepo.findById(requestingUserId);
    if (!requestingUser) {
      throw new NotFoundError("Requesting user");
    }

    if (requestingUser.role !== "ADMIN") {
      throw new AuthorizationError(
        "You are not authorized to delete this user"
      );
    }

    return await UserRepo.delete(id);
  }

  static async getDashboardIdFromUserId(userId: string): Promise<string> {
    const dashboardId = await UserRepo.getDashboardId(userId);
    if (!dashboardId) {
      throw new NotFoundError("Dashboard");
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
