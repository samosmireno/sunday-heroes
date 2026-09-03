import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Role } from "@repo/shared-types";
import { axiosResponse, createTestProviders } from "@/test/harness";
import { competitionInfo } from "@/test/fixtures";
import { useCompetitionInfo } from "./use-competition-info";

const competitionId = "comp-1";
const userId = "user-1";

describe("useCompetitionInfo", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("asks the server for the user's role and caches the read per user", async () => {
    const get = vi
      .spyOn(axios, "get")
      .mockResolvedValue(
        axiosResponse(competitionInfo({ userRole: Role.ADMIN })),
      );
    const wrapper = createTestProviders();

    const page = renderHook(
      () => ({
        info: useCompetitionInfo(competitionId, userId),
        queryClient: useQueryClient(),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(page.result.current.info.competition?.userRole).toBe(Role.ADMIN),
    );

    const requestedUrl = new URL(get.mock.calls[0][0]);
    expect(requestedUrl.searchParams.get("userId")).toBe(userId);
    expect(
      page.result.current.queryClient.getQueryData([
        "competitionInfo",
        competitionId,
        userId,
      ]),
    ).toMatchObject({ userRole: Role.ADMIN });
  });

  it("reads without a user when none is known", async () => {
    const get = vi
      .spyOn(axios, "get")
      .mockResolvedValue(axiosResponse(competitionInfo()));
    const wrapper = createTestProviders();

    const page = renderHook(() => useCompetitionInfo(competitionId), {
      wrapper,
    });
    await waitFor(() =>
      expect(page.result.current.competition?.userRole).toBe(Role.PLAYER),
    );

    const requestedUrl = new URL(get.mock.calls[0][0]);
    expect(requestedUrl.searchParams.has("userId")).toBe(false);
  });
});
