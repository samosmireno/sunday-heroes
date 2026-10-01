import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { StatusResponse } from "@repo/shared-types";
import axiosInstance from "@/config/axios-config";
import { axiosResponse, createTestProviders } from "@/test/harness";
import { ReadOnlyBanner } from "./read-only-banner";

function renderBanner(status: StatusResponse) {
  const get = vi
    .spyOn(axiosInstance, "get")
    .mockResolvedValue(axiosResponse(status));
  render(<ReadOnlyBanner />, { wrapper: createTestProviders() });
  return get;
}

describe("ReadOnlyBanner", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("says the app has moved, and links to it, while the flag is on", async () => {
    renderBanner({ readOnly: true });

    const banner = await screen.findByRole("status");
    expect(banner.textContent).toBe(
      "Sunday Heroes has moved to sunday-heroes.app. This copy is read-only.",
    );
    expect(
      screen
        .getByRole("link", { name: "sunday-heroes.app" })
        .getAttribute("href"),
    ).toBe("https://sunday-heroes.app");
  });

  it("shows nothing while the flag is off", async () => {
    const get = renderBanner({ readOnly: false });

    await waitFor(() =>
      expect(get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/status$/)),
    );
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("shows nothing when the status can't be read", async () => {
    const get = vi
      .spyOn(axiosInstance, "get")
      .mockRejectedValue(new Error("Network Error"));
    render(<ReadOnlyBanner />, { wrapper: createTestProviders() });

    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(screen.queryByRole("status")).toBeNull();
  });
});
