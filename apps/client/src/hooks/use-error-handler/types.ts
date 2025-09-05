export interface AppError {
  name?: string;
  message?: string;
  status?: number;
  statusCode?: number;
  fields?: Array<{ field: string; message: string }>;
  response?: {
    data?: {
      fields?: Array<{ field: string; message: string }>;
      resource?: string;
      message?: string;
    };
  };
}
