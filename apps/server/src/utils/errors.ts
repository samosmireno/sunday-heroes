export class AppError extends Error {
  public readonly name: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    name: string,
    statusCode: number,
    description: string,
    isOperational: boolean
  ) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super("AuthenticationError", 401, message, true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access forbidden") {
    super("AuthorizationError", 403, message, true);
  }
}

export class NotFoundError extends AppError {
  public readonly resource: string;

  constructor(resource: string = "Resource") {
    super("NotFoundError", 404, `${resource} not found`, true);
    this.resource = resource.toLowerCase();
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("ConflictError", 409, message, true);
  }
}

export class ValidationError extends AppError {
  public readonly fields: Array<{
    field: string;
    message: string;
    code: string;
  }>;

  constructor(fields: Array<{ field: string; message: string; code: string }>) {
    const message = `Validation failed: ${fields.map((f) => f.field).join(", ")}`;
    super("ValidationError", 400, message, true);
    this.fields = fields;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super("BadRequestError", 400, message, true);
  }
}

export class InvitationError extends AppError {
  constructor(message: string) {
    super("InvitationError", 400, message, true);
  }
}

export class MatchError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super("MatchError", statusCode, message, true);
  }
}

export class VotingError extends AppError {
  constructor(message: string, statusCode: number = 400) {
    super("VotingError", statusCode, message, true);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed") {
    super("DatabaseError", 500, message, false);
  }
}

export class ExternalServiceError extends AppError {
  public readonly service: string;

  constructor(
    service: string,
    message: string = "External service unavailable"
  ) {
    super("ExternalServiceError", 503, `${service}: ${message}`, false);
    this.service = service;
  }
}

export class TokenExpiredError extends AppError {
  constructor(message: string = "Token has expired") {
    super("TokenExpiredError", 401, message, true);
  }
}

export class InvalidTokenError extends AppError {
  constructor(message: string = "Invalid token") {
    super("InvalidTokenError", 401, message, true);
  }
}
