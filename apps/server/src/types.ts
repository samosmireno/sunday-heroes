export type AuthResponse = {
  loggedIn: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
  dashboardId?: string | null;
};
