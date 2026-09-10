export interface AppError {
  name?: string;
  message?: string;
  status?: number;
  statusCode?: number;
  fields?: Array<{ field: string; message: string }>;
  response?: {
    status?: number;
    data?: {
      code?: number;
      fields?: Array<{ field: string; message: string }>;
      resource?: string;
      message?: string;
    };
  };
}
