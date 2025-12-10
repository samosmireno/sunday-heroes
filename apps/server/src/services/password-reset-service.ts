import crypto from "crypto";
import bcrypt from "bcrypt";
import { UserRepo } from "../repositories/user/user-repo";
import {
  BadRequestError,
  InvalidTokenError,
  NotFoundError,
  TokenExpiredError,
} from "../utils/errors";

export class PasswordResetService {
  static readonly RESET_TOKEN_EXPIRY_MS = 1 * 60 * 60 * 1000; // 1 hour

  static generateResetToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static async createPasswordResetToken(email: string): Promise<string> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserRepo.findByEmail(normalizedEmail);

    if (!user) {
      throw new NotFoundError(
        "If an account exists, you will receive a reset email"
      );
    }

    if (!user.password) {
      throw new BadRequestError(
        "This account uses Google login. Please sign in with Google."
      );
    }

    const resetToken = this.generateResetToken();
    const resetTokenExpiresAt = new Date(
      Date.now() + this.RESET_TOKEN_EXPIRY_MS
    );

    await UserRepo.update(user.id, {
      resetToken,
      resetTokenExpiresAt,
    });

    return resetToken;
  }

  static async validateResetToken(
    token: string
  ): Promise<{ userId: string; email: string }> {
    const user = await UserRepo.findByResetToken(token);

    if (!user || !user.resetTokenExpiresAt) {
      throw new InvalidTokenError("Invalid or expired reset token");
    }

    if (user.resetTokenExpiresAt < new Date()) {
      throw new TokenExpiredError("Reset token has expired");
    }

    return { userId: user.id, email: user.email };
  }

  static async clearResetToken(userId: string): Promise<void> {
    await UserRepo.update(userId, {
      resetToken: null,
      resetTokenExpiresAt: null,
    });
  }

  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    const { userId } = await this.validateResetToken(token);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserRepo.update(userId, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiresAt: null,
    });
  }
}
