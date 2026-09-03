import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { CompetitionType } from "@repo/shared-types";
import axiosInstance from "@/config/axios-config";
import { useCompetition } from "@/features/competition/use-competition";
import { useCompetitionSettings } from "@/features/competition/use-competition-settings";
import { axiosResponse, createTestProviders } from "@/test/harness";
import {
  competitionResponse,
  competitionSettings,
  currentSeasonResponse,
  matchResponse,
  seasonResponse,
} from "@/test/fixtures";
import {
  useResetCompetition,
  useStartNewSeason,
} from "./use-competition-mutations";

const competitionId = "comp-1";
const userId = "user-1";

describe("useStartNewSeason", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** The settings read answers season 1 before the rollover and season 2 after it. */
  function stubServer(type: CompetitionType) {
    const before = competitionSettings({
      type,
      currentSeason: currentSeasonResponse({ number: 1, matchCount: 4 }),
    });
    const after = competitionSettings({
      type,
      currentSeason: currentSeasonResponse({ number: 2, matchCount: 0 }),
    });
    vi.spyOn(axios, "get")
      .mockResolvedValueOnce(axiosResponse(before))
      .mockResolvedValue(axiosResponse(after));
    const post = vi
      .spyOn(axiosInstance, "post")
      .mockResolvedValue(axiosResponse(seasonResponse({ number: 2 })));
    const success = vi.spyOn(toast, "success").mockImplementation(() => "");
    return { post, success };
  }

  it("Duel: the Season card re-renders to the new season and the admin stays put", async () => {
    const { post, success } = stubServer(CompetitionType.DUEL);
    const { result } = renderHook(
      () => ({
        settings: useCompetitionSettings(competitionId, userId),
        rollover: useStartNewSeason(competitionId, CompetitionType.DUEL),
        location: useLocation(),
      }),
      { wrapper: createTestProviders() },
    );
    await waitFor(() =>
      expect(result.current.settings.competition?.currentSeason.number).toBe(1),
    );

    await act(() => result.current.rollover.mutateAsync());

    await waitFor(() =>
      expect(result.current.settings.competition?.currentSeason.number).toBe(2),
    );
    expect(post).toHaveBeenCalledWith(
      expect.stringContaining(`/api/competitions/${competitionId}/seasons`),
      {},
      { withCredentials: true },
    );
    expect(success).toHaveBeenCalledWith("Season 2 has started.");
    expect(result.current.location.pathname).toBe("/");
  });

  it("League: the admin is sent to Teams setup", async () => {
    stubServer(CompetitionType.LEAGUE);
    const { result } = renderHook(
      () => ({
        rollover: useStartNewSeason(competitionId, CompetitionType.LEAGUE),
        location: useLocation(),
      }),
      { wrapper: createTestProviders() },
    );

    await act(() => result.current.rollover.mutateAsync());

    expect(result.current.location.pathname).toBe(
      `/league-setup/${competitionId}`,
    );
  });

  it("shows the Duel page's Current season afresh after the rollover", async () => {
    vi.spyOn(axiosInstance, "post").mockResolvedValue(
      axiosResponse(seasonResponse({ number: 2 })),
    );
    vi.spyOn(toast, "success").mockImplementation(() => "");
    // The competition read is cached for minutes, so only an invalidation refetches it.
    vi.spyOn(axios, "get")
      .mockResolvedValueOnce(
        axiosResponse(
          competitionResponse({ matches: [matchResponse({ id: "match-1" })] }),
        ),
      )
      .mockResolvedValue(axiosResponse(competitionResponse({ matches: [] })));
    const wrapper = createTestProviders();

    const firstVisit = renderHook(() => useCompetition(competitionId, userId), {
      wrapper,
    });
    await waitFor(() =>
      expect(firstVisit.result.current.competition?.matches).toHaveLength(1),
    );
    firstVisit.unmount();

    const settingsPage = renderHook(
      () => useStartNewSeason(competitionId, CompetitionType.DUEL),
      { wrapper },
    );
    await act(() => settingsPage.result.current.mutateAsync());
    settingsPage.unmount();

    const returnVisit = renderHook(
      () => useCompetition(competitionId, userId),
      { wrapper },
    );
    await waitFor(() =>
      expect(returnVisit.result.current.competition?.matches).toEqual([]),
    );
  });

  it("surfaces the server's refusal through the error toast", async () => {
    vi.spyOn(axiosInstance, "post").mockRejectedValue({
      response: { data: { message: "The season has already been closed." } },
    });
    const error = vi.spyOn(toast, "error").mockImplementation(() => "");
    const { result } = renderHook(
      () => useStartNewSeason(competitionId, CompetitionType.DUEL),
      { wrapper: createTestProviders() },
    );

    await act(() => result.current.mutateAsync().catch(() => undefined));

    expect(error).toHaveBeenCalledWith("The season has already been closed.");
  });
});

describe("useResetCompetition", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** The settings read answers three seasons before the reset and a fresh Season 1 after it. */
  function stubServer(type: CompetitionType, name: string) {
    const before = competitionSettings({
      name,
      type,
      currentSeason: currentSeasonResponse({ number: 3, matchCount: 10 }),
      seasons: [
        seasonResponse({ number: 1, endedAt: "2025-12-01T10:00:00.000Z" }),
        seasonResponse({ number: 2, endedAt: "2026-05-01T10:00:00.000Z" }),
        seasonResponse({ number: 3, matchCount: 10 }),
      ],
    });
    const after = competitionSettings({
      name,
      type,
      currentSeason: currentSeasonResponse({ number: 1, matchCount: 0 }),
    });
    vi.spyOn(axios, "get")
      .mockResolvedValueOnce(axiosResponse(before))
      .mockResolvedValue(axiosResponse(after));
    const post = vi
      .spyOn(axiosInstance, "post")
      .mockResolvedValue(axiosResponse({}));
    const success = vi.spyOn(toast, "success").mockImplementation(() => "");
    return { before, post, success };
  }

  it("Duel: the admin stays on the Settings tab and the Season card re-renders as Season 1", async () => {
    const { before, post, success } = stubServer(
      CompetitionType.DUEL,
      "Thursday Duel",
    );
    const { result } = renderHook(
      () => ({
        settings: useCompetitionSettings(competitionId, userId),
        reset: useResetCompetition(before),
        location: useLocation(),
      }),
      { wrapper: createTestProviders() },
    );
    await waitFor(() =>
      expect(result.current.settings.competition?.seasons).toHaveLength(3),
    );

    await act(() => result.current.reset.mutateAsync());

    await waitFor(() =>
      expect(result.current.settings.competition?.currentSeason.number).toBe(1),
    );
    expect(result.current.settings.competition?.seasons).toHaveLength(1);
    expect(post).toHaveBeenCalledWith(
      expect.stringContaining(`/api/competitions/${competitionId}/reset`),
      {},
      { withCredentials: true },
    );
    expect(success).toHaveBeenCalledWith('"Thursday Duel" has been reset.');
    expect(result.current.location.pathname).toBe("/");
  });

  it("League: the admin is sent to Teams setup", async () => {
    const { before, success } = stubServer(
      CompetitionType.LEAGUE,
      "Sunday League",
    );
    const { result } = renderHook(
      () => ({
        reset: useResetCompetition(before),
        location: useLocation(),
      }),
      { wrapper: createTestProviders() },
    );

    await act(() => result.current.reset.mutateAsync());

    expect(success).toHaveBeenCalledWith('"Sunday League" has been reset.');
    expect(result.current.location.pathname).toBe(
      `/league-setup/${competitionId}`,
    );
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
    vi.spyOn(toast, "success").mockImplementation(() => "");
    const wrapper = createTestProviders();

    const firstVisit = renderHook(() => useCompetition(competitionId, userId), {
      wrapper,
    });
    await waitFor(() =>
      expect(firstVisit.result.current.competition?.matches).toHaveLength(1),
    );
    firstVisit.unmount();

    const settingsPage = renderHook(
      () =>
        useResetCompetition(
          competitionSettings({
            id: competitionId,
            type: CompetitionType.DUEL,
          }),
        ),
      { wrapper },
    );
    await act(() => settingsPage.result.current.mutateAsync());
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
