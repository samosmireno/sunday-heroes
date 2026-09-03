import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AuthProvider } from "@/context/auth-context";

/**
 * The provider stack a hook sees in the app (query client, router, error
 * boundary, auth). Every render through one wrapper shares one QueryClient,
 * so a test can leave a page and come back to the same cache.
 */
export function createTestProviders() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ErrorBoundary fallback={null}>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return wrapper;
}

/** A successful server answer, for stubbing axios at the HTTP boundary. */
export function axiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}
