import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AuthProvider } from "@/context/auth-context";
import { SidebarProvider } from "@/components/ui/sidebar";

/**
 * jsdom implements no `matchMedia`, and `SidebarProvider` asks for one on
 * mount to decide whether it is on a phone. Defined only when it is missing,
 * so a test that wants its own stub still wins.
 */
function ensureMatchMedia() {
  // Typed as always defined, which is true of a browser and not of jsdom.
  if (typeof window === "undefined") return;
  if (typeof window.matchMedia === "function") return;

  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

/**
 * The provider stack a page sees in the app (query client, router, error
 * boundary, auth, sidebar). Every render through one wrapper shares one
 * QueryClient, so a test can leave a page and come back to the same cache.
 *
 * `SidebarProvider` is innermost, where `AppLayout` puts it: any page whose
 * `Header` has `hasSidebar` reaches for it on mount, so a page test that had
 * to supply its own would be reproducing the app's own layout to render at
 * all.
 *
 * `at` is the URL the router opens on, so a hook's first render sees a link's
 * `?season=` the way the page does.
 */
export function createTestProviders({ at }: { at?: string } = {}) {
  ensureMatchMedia();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[at ?? "/"]}>
        <ErrorBoundary fallback={null}>
          <AuthProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </AuthProvider>
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

/** The 404 the server answers a resource it does not have with, as the error handler reads it. */
export function axiosNotFound(resource: string) {
  return Object.assign(new Error("Request failed with status code 404"), {
    status: 404,
    response: { data: { resource } },
  });
}
