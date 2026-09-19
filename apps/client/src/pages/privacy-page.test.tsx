import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ensureMatchMedia } from "@/test/harness";
import App from "@/app";

/**
 * Google's OAuth consent screen links here, so the page has to open for a
 * visitor who has never signed in. It is rendered through the app's own router
 * rather than the harness, so moving the route under `ProtectedRoute`, which
 * sends a signed-out visitor to the landing page, fails this test.
 */
describe("/privacy", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("opens for a signed-out visitor", async () => {
    localStorage.removeItem("user");
    ensureMatchMedia();
    window.history.pushState({}, "", "/privacy");

    render(
      <QueryClientProvider client={new QueryClient()}>
        <App />
      </QueryClientProvider>,
    );

    await screen.findByRole("heading", { level: 1, name: "Privacy policy" });
    expect(window.location.pathname).toBe("/privacy");
  });
});
