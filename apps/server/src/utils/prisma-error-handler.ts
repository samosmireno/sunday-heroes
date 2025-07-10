import { Prisma } from "@prisma/client";
import {
  AppError,
  DatabaseError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from "./errors";

export class PrismaErrorHandler {
  static handle(error: unknown, context?: string): AppError {
    console.error(`Prisma error${context ? ` in ${context}` : ""}:`, error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handleKnownRequestError(error);
    }

    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      return this.handleUnknownRequestError(error);
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
      return this.handleRustPanicError(error);
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return this.handleInitializationError(error);
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return this.handleValidationError(error);
    }

    // If it's already an AppError, return it
    if (error instanceof AppError) {
      return error;
    }

    // Fallback for unknown errors
    return new DatabaseError("An unexpected database error occurred");
  }

  private static handleKnownRequestError(
    error: Prisma.PrismaClientKnownRequestError
  ): AppError {
    switch (error.code) {
      case "P2001": // Record not found
        return new NotFoundError(this.extractResourceFromMeta(error.meta));

      case "P2002": // Unique constraint violation
        const field = this.extractFieldFromUniqueConstraint(error.meta);
        return new ConflictError(`${field} already exists`);

      case "P2003": // Foreign key constraint violation
        return new ConflictError(
          "Cannot perform operation due to related records"
        );

      case "P2025": // Record not found for update/delete
        return new NotFoundError(this.extractResourceFromMeta(error.meta));

      case "P2014": // Required relation violation
        return new ValidationError([
          {
            field: "relation",
            message: "Required relationship is missing",
            code: "MISSING_RELATION",
          },
        ]);

      case "P2004": // Constraint violation
        return new ValidationError([
          {
            field: "constraint",
            message: "Data violates database constraints",
            code: "CONSTRAINT_VIOLATION",
          },
        ]);

      case "P2015": // Related record not found
        return new NotFoundError("Related record");

      case "P2016": // Query interpretation error
        return new ValidationError([
          {
            field: "query",
            message: "Invalid query parameters",
            code: "INVALID_QUERY",
          },
        ]);

      case "P2021": // Table does not exist
      case "P2022": // Column does not exist
        return new DatabaseError("Database schema error");

      default:
        return new DatabaseError("Database operation failed");
    }
  }

  private static handleUnknownRequestError(
    error: Prisma.PrismaClientUnknownRequestError
  ): AppError {
    return new DatabaseError("Database connection error");
  }

  private static handleRustPanicError(
    error: Prisma.PrismaClientRustPanicError
  ): AppError {
    return new DatabaseError("Database engine error");
  }

  private static handleInitializationError(
    error: Prisma.PrismaClientInitializationError
  ): AppError {
    return new DatabaseError("Database initialization failed");
  }

  private static handleValidationError(
    error: Prisma.PrismaClientValidationError
  ): AppError {
    // Extract field information from validation error message
    const fields = this.parseValidationErrorMessage(error.message);
    return new ValidationError(fields);
  }

  private static extractResourceFromMeta(meta: any): string {
    if (meta?.model_name) {
      return meta.model_name;
    }
    if (meta?.table) {
      return meta.table;
    }
    return "Resource";
  }

  private static extractFieldFromUniqueConstraint(meta: any): string {
    if (meta?.target && Array.isArray(meta.target)) {
      return meta.target.join(", ");
    }
    return "Field";
  }

  private static parseValidationErrorMessage(
    message: string
  ): Array<{ field: string; message: string; code: string }> {
    // Parse Prisma validation error messages
    // This is a simplified version - you might want to make it more sophisticated
    return [
      {
        field: "validation",
        message: "Invalid data provided",
        code: "VALIDATION_ERROR",
      },
    ];
  }
}
