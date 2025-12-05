import bcrypt from "bcrypt";

export class PasswordUtils {
  private static readonly SALT_ROUNDS = 10;

  static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static validate(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return {
        valid: false,
        message: "Password must be at least 8 characters",
      };
    }
    if (!/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain an uppercase letter",
      };
    }
    if (!/[a-z]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain a lowercase letter",
      };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: "Password must contain a number" };
    }
    return { valid: true };
  }
}
