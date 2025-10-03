export interface SuccessResponse<T> {
  data?: T;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

export interface ValidationErrorResponse {
  error: string;
  validation_errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
