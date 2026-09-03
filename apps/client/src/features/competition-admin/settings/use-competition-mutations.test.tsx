import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import axiosInstance from "@/config/axios-config";
import { useCompetition } from "@/features/competition/use-competition";
import { axiosResponse, createTestProviders } from "@/test/harness";
import { competitionResponse, matchResponse } from "@/test/fixtures";
import { useResetCompetition } from "./use-competition-mutations";

const competitionId = "comp-1";
const userId = "user-1";

describe("useResetCompetition", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows an empty competition page after resetting the competition", async () => {
    // The server has one match on the first visit and none after the reset.
    vi.spyOn(axios, "get")
      .mockResolvedValueOnce(
        axiosResponse(
          competitionResponse({ matches: [matchResponse({ id: "match-1" })] }),
        ),
      )
      .mockResolvedValue(axiosResponse(competitionResponse({ matches: [] })));
    vi.spyOn(axiosInstance, "post").mockResolvedValue(axiosResponse({}));
    const wrapper = createTestProviders();

    const firstVisit = renderHook(() => useCompetition(competitionId, userId), {
      wrapper,
    });
    await waitFor(() =>
      expect(firstVisit.result.current.competition?.matches).toHaveLength(1),
    );
    firstVisit.unmount();

    const settingsPage = renderHook(() => useResetCompetition(competitionId), {
      wrapper,
    });
    act(() => settingsPage.result.current.mutate());
    await waitFor(() =>
      expect(settingsPage.result.current.isPending).toBe(false),
    );
    settingsPage.unmount();

    const returnVisit = renderHook(
      () => useCompetition(competitionId, userId),
      { wrapper },
    );
    await waitFor(() =>
      expect(returnVisit.result.current.competition?.matches).toEqual([]),
    );
  });
});
