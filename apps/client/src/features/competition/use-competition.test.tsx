import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { SeasonResponse } from "@repo/shared-types";
import { axiosResponse, createTestProviders } from "@/test/harness";
import {
  competitionInfo,
  competitionResponse,
  matchResponse,
  seasonResponse,
} from "@/test/fixtures";
import { useCompetitionInfo } from "./use-competition-info";
import { SeasonParam, useSeasonParam } from "./use-season-param";
import { useCompetition } from "./use-competition";

const competitionId = "comp-1";
const userId = "user-1";

const requestedSeason = (url: string) =>
  new URL(url).searchParams.get("season");

describe("useCompetition", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes the selected season to the server verbatim and keys the read on it", async () => {
    const get = vi.spyOn(axios, "get").mockResolvedValue(
      axiosResponse(
        competitionResponse({
          matches: [
            matchResponse({
              id: "match-1",
              season: { number: 2, isClosed: true },
            }),
          ],
        }),
      ),
    );
    const wrapper = createTestProviders();

    const page = renderHook(
      () => ({
        read: useCompetition(competitionId, userId, 2),
        queryClient: useQueryClient(),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(page.result.current.read.competition?.matches).toHaveLength(1),
    );

    expect(requestedSeason(get.mock.calls[0][0])).toBe("2");
    expect(
      page.result.current.queryClient.getQueryData([
        "competition",
        { compId: competitionId, userId, season: 2 },
      ]),
    ).toMatchObject({ matches: [{ id: "match-1" }] });
  });

  it("asks for the Current season by sending no season, and for All seasons as 'all'", async () => {
    const get = vi
      .spyOn(axios, "get")
      .mockResolvedValue(axiosResponse(competitionResponse()));
    const wrapper = createTestProviders();

    const page = renderHook(
      ({ season }: { season: SeasonParam }) =>
        useCompetition(competitionId, userId, season),
      { wrapper, initialProps: { season: undefined as SeasonParam } },
    );
    await waitFor(() => expect(page.result.current.competition).toBeDefined());
    expect(requestedSeason(get.mock.calls[0][0])).toBeNull();

    page.rerender({ season: "all" });
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
    expect(requestedSeason(get.mock.calls[1][0])).toBe("all");
  });

  it("holds the read back until the selection is resolved, then sends it", async () => {
    const get = vi
      .spyOn(axios, "get")
      .mockResolvedValue(axiosResponse(competitionResponse()));
    const wrapper = createTestProviders();

    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useCompetition(competitionId, userId, 2, { enabled }),
      { wrapper, initialProps: { enabled: false } },
    );
    expect(get).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({
      competition: undefined,
      isLoading: false,
    });

    rerender({ enabled: true });
    await waitFor(() => expect(result.current.competition).toBeDefined());
    expect(get).toHaveBeenCalledTimes(1);
    expect(requestedSeason(get.mock.calls[0][0])).toBe("2");
  });
});

/** Seasons 1 and 2 are Past seasons; Season 3 is the Current season. */
const threeSeasons: SeasonResponse[] = [
  seasonResponse({ number: 1, endedAt: "2025-03-02T10:00:00.000Z" }),
  seasonResponse({ number: 2, endedAt: "2025-09-14T10:00:00.000Z" }),
  seasonResponse({ number: 3, endedAt: null }),
];

/**
 * The app's providers with the router opened at the competition URL, so the
 * hook's first render sees the link's `?season=` the way the page does.
 */
function atCompetitionUrl(search: string) {
  const Providers = createTestProviders();
  return ({ children }: { children: ReactNode }) => (
    <Providers>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate to={`/competition/${competitionId}${search}`} replace />
          }
        />
        <Route path="/competition/:competitionId" element={children} />
      </Routes>
    </Providers>
  );
}

/** The 404 the server answers a Season it does not have with, as the error handler reads it. */
const seasonNotFound = () =>
  Object.assign(new Error("Request failed with status code 404"), {
    status: 404,
    response: { data: { resource: "Season" } },
  });

/**
 * The server as the competition page sees it: the info read with three
 * Seasons, and the stats read refusing a season the list does not have.
 */
function stubServer() {
  return vi.spyOn(axios, "get").mockImplementation(async (url: string) => {
    const { pathname, searchParams } = new URL(url);
    if (pathname.endsWith("/competitions/info")) {
      return axiosResponse(competitionInfo({ seasons: threeSeasons }));
    }
    const season = searchParams.get("season");
    if (
      season !== null &&
      !threeSeasons.some((s) => String(s.number) === season)
    ) {
      throw seasonNotFound();
    }
    return axiosResponse(competitionResponse());
  });
}

const statsRequests = (get: ReturnType<typeof stubServer>) =>
  get.mock.calls
    .map(([url]) => new URL(url))
    .filter((url) => url.pathname.endsWith("/competitions/stats"));

/** The competition page's reads: the info, the season selection on it, and the stats read gated on that. */
function useCompetitionPageReads() {
  const { competition: info } = useCompetitionInfo(competitionId, userId);
  const { season, resolved } = useSeasonParam(info?.seasons);
  return {
    read: useCompetition(competitionId, userId, season, { enabled: resolved }),
    location: useLocation(),
  };
}

describe("useCompetition at a competition URL", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(["9", "abc"])(
    "?season=%s shows the Current season with no toast and drops the param, never asking the server for it",
    async (stale) => {
      const get = stubServer();
      const toastError = vi.spyOn(toast, "error");

      const page = renderHook(useCompetitionPageReads, {
        wrapper: atCompetitionUrl(`?season=${stale}`),
      });
      await waitFor(() =>
        expect(page.result.current.read.competition).toBeDefined(),
      );

      const stats = statsRequests(get);
      expect(stats).toHaveLength(1);
      expect(stats[0].searchParams.has("season")).toBe(false);
      expect(toastError).not.toHaveBeenCalled();
      expect(
        new URLSearchParams(page.result.current.location.search).has("season"),
      ).toBe(false);
    },
  );

  it("?season=2 loads Season 2 directly, with no read for the Current season first", async () => {
    const get = stubServer();

    const page = renderHook(useCompetitionPageReads, {
      wrapper: atCompetitionUrl("?season=2"),
    });
    await waitFor(() =>
      expect(page.result.current.read.competition).toBeDefined(),
    );

    const stats = statsRequests(get);
    expect(stats).toHaveLength(1);
    expect(stats[0].searchParams.get("season")).toBe("2");
    expect(
      new URLSearchParams(page.result.current.location.search).get("season"),
    ).toBe("2");
  });
});
