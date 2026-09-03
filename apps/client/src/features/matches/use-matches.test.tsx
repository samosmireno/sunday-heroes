import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { toast } from "sonner";
import { MatchPageResponse, SeasonResponse } from "@repo/shared-types";
import { axiosResponse, createTestProviders } from "@/test/harness";
import {
  competitionInfo,
  matchPageResponse,
  seasonResponse,
} from "@/test/fixtures";
import { useCompetitionInfo } from "@/features/competition/use-competition-info";
import {
  SeasonParam,
  useSeasonParam,
} from "@/features/competition/use-season-param";
import { useMatches } from "./use-matches";

const userId = "user-1";
const competitionId = "comp-1";

const requestedSeason = (url: string) =>
  new URL(url).searchParams.get("season");

/** The paginated read's answer: one page plus the count header the server sets. */
function matchesPage(
  matches: MatchPageResponse[],
  totalCount: number,
): AxiosResponse<MatchPageResponse[]> {
  return {
    ...axiosResponse(matches),
    headers: { "x-total-count": String(totalCount) },
  };
}

describe("useMatches", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes the selected season to the server verbatim and keys the read on it", async () => {
    const get = vi.spyOn(axios, "get").mockResolvedValue(
      matchesPage(
        [
          matchPageResponse({
            id: "match-1",
            season: { number: 2, isClosed: true },
          }),
        ],
        1,
      ),
    );
    const wrapper = createTestProviders();

    const page = renderHook(
      () => ({
        read: useMatches({ userId, competitionId, page: 1, season: 2 }),
        queryClient: useQueryClient(),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(page.result.current.read.matches).toHaveLength(1),
    );

    expect(requestedSeason(get.mock.calls[0][0])).toBe("2");
    expect(
      page.result.current.queryClient.getQueryData([
        "matches",
        { userId, competitionId, page: 1, season: 2 },
      ]),
    ).toMatchObject({ data: [{ id: "match-1" }] });
  });

  it("takes the pagination counts from the filtered count header", async () => {
    vi.spyOn(axios, "get").mockResolvedValue(
      matchesPage(
        Array.from({ length: 10 }, (_, i) =>
          matchPageResponse({ id: `match-${i + 1}` }),
        ),
        25,
      ),
    );
    const wrapper = createTestProviders();

    const { result } = renderHook(
      () => useMatches({ userId, competitionId, page: 1, season: 2 }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.matches).toHaveLength(10));

    expect(result.current).toMatchObject({ totalCount: 25, totalPages: 3 });
  });

  it("asks for the Current season by sending no season, and for All seasons as 'all'", async () => {
    const get = vi
      .spyOn(axios, "get")
      .mockResolvedValue(matchesPage([matchPageResponse()], 1));
    const wrapper = createTestProviders();

    const { result, rerender } = renderHook(
      ({ season }: { season: SeasonParam }) =>
        useMatches({ userId, competitionId, page: 1, season }),
      { wrapper, initialProps: { season: undefined as SeasonParam } },
    );
    await waitFor(() => expect(result.current.matches).toHaveLength(1));
    expect(requestedSeason(get.mock.calls[0][0])).toBeNull();

    rerender({ season: "all" });
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
    expect(requestedSeason(get.mock.calls[1][0])).toBe("all");
  });

  it("keeps the previous page's rows in place while the next page loads", async () => {
    vi.spyOn(axios, "get")
      .mockResolvedValueOnce(matchesPage([matchPageResponse()], 25))
      .mockReturnValue(new Promise(() => {}));
    const wrapper = createTestProviders();

    const { result, rerender } = renderHook(
      ({ page }: { page: number }) =>
        useMatches({ userId, competitionId, page, season: 2 }),
      { wrapper, initialProps: { page: 1 } },
    );
    await waitFor(() => expect(result.current.matches).toHaveLength(1));

    rerender({ page: 2 });

    expect(result.current.matches).toHaveLength(1);
    expect(result.current).toMatchObject({ totalCount: 25, isLoading: false });
  });

  it("shows none of the previous season's rows or counts while the selected season loads", async () => {
    vi.spyOn(axios, "get")
      .mockResolvedValueOnce(matchesPage([matchPageResponse()], 25))
      .mockReturnValue(new Promise(() => {}));
    const wrapper = createTestProviders();

    const { result, rerender } = renderHook(
      ({ season }: { season: SeasonParam }) =>
        useMatches({ userId, competitionId, page: 1, season }),
      { wrapper, initialProps: { season: undefined as SeasonParam } },
    );
    await waitFor(() => expect(result.current.matches).toHaveLength(1));

    rerender({ season: 2 });

    expect(result.current.matches).toHaveLength(0);
    expect(result.current).toMatchObject({ totalCount: 0, isLoading: true });
  });

  it("holds a competition's read back until the selection is resolved, pending meanwhile", async () => {
    const get = vi
      .spyOn(axios, "get")
      .mockResolvedValue(matchesPage([matchPageResponse()], 1));
    const wrapper = createTestProviders();

    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useMatches({ userId, competitionId, page: 1, season: 2, enabled }),
      { wrapper, initialProps: { enabled: false } },
    );
    expect(get).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({
      matches: [],
      isPending: true,
      isLoading: false,
      isError: false,
    });

    rerender({ enabled: true });
    await waitFor(() => expect(result.current.matches).toHaveLength(1));
    expect(get).toHaveBeenCalledTimes(1);
    expect(requestedSeason(get.mock.calls[0][0])).toBe("2");
  });

  it("never sends a season on the user-wide read, which spans competitions", async () => {
    const get = vi
      .spyOn(axios, "get")
      .mockResolvedValue(matchesPage([matchPageResponse()], 1));
    const wrapper = createTestProviders();

    const { result } = renderHook(
      () => ({
        read: useMatches({ userId, page: 1, season: 2 }),
        queryClient: useQueryClient(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.read.matches).toHaveLength(1));

    const url = new URL(get.mock.calls[0][0]);
    expect(url.searchParams.has("competitionId")).toBe(false);
    expect(url.searchParams.has("season")).toBe(false);
    expect(
      result.current.queryClient.getQueryData([
        "matches",
        { userId, competitionId: undefined, page: 1, season: undefined },
      ]),
    ).toBeDefined();
  });

  it("never waits on a season for the user-wide read either", async () => {
    const get = vi
      .spyOn(axios, "get")
      .mockResolvedValue(matchesPage([matchPageResponse()], 1));
    const wrapper = createTestProviders();

    const { result } = renderHook(
      () => useMatches({ userId, page: 1, season: 2, enabled: false }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.matches).toHaveLength(1));

    expect(requestedSeason(get.mock.calls[0][0])).toBeNull();
  });
});

/** Seasons 1 and 2 are Past seasons; Season 3 is the Current season. */
const threeSeasons: SeasonResponse[] = [
  seasonResponse({ number: 1, endedAt: "2025-03-02T10:00:00.000Z" }),
  seasonResponse({ number: 2, endedAt: "2025-09-14T10:00:00.000Z" }),
  seasonResponse({ number: 3, endedAt: null }),
];

/**
 * The app's providers with the router opened at the competition's All
 * Matches URL, so the hook's first render sees the link's `?season=` the way
 * the page does.
 */
function atMatchesUrl(search: string) {
  const Providers = createTestProviders();
  return ({ children }: { children: ReactNode }) => (
    <Providers>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate to={`/matches/${competitionId}${search}`} replace />
          }
        />
        <Route path="/matches/:competitionId" element={children} />
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
 * The server as All Matches sees it: the info read with three Seasons, and
 * the matches read refusing a season the list does not have.
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
    return matchesPage([matchPageResponse()], 1);
  });
}

const matchesRequests = (get: ReturnType<typeof stubServer>) =>
  get.mock.calls
    .map(([url]) => new URL(url))
    .filter((url) => url.pathname.endsWith("/matches/stats"));

/** All Matches' reads for a competition: the info, the season selection on it, and the list gated on that. */
function useMatchesPageReads() {
  const { competition: info } = useCompetitionInfo(competitionId, userId);
  const { season, resolved } = useSeasonParam(info?.seasons);
  return {
    read: useMatches({
      userId,
      competitionId,
      page: 1,
      season,
      enabled: resolved,
    }),
    location: useLocation(),
  };
}

describe("useMatches at a competition's All Matches URL", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(["9", "abc"])(
    "?season=%s shows the Current season with no toast and drops the param, never asking the server for it",
    async (stale) => {
      const get = stubServer();
      const toastError = vi.spyOn(toast, "error");

      const page = renderHook(useMatchesPageReads, {
        wrapper: atMatchesUrl(`?season=${stale}`),
      });
      await waitFor(() =>
        expect(page.result.current.read.matches).toHaveLength(1),
      );

      const requests = matchesRequests(get);
      expect(requests).toHaveLength(1);
      expect(requests[0].searchParams.has("season")).toBe(false);
      expect(toastError).not.toHaveBeenCalled();
      expect(
        new URLSearchParams(page.result.current.location.search).has("season"),
      ).toBe(false);
    },
  );

  it("?season=2 loads Season 2 directly, with no read for the Current season first", async () => {
    const get = stubServer();

    const page = renderHook(useMatchesPageReads, {
      wrapper: atMatchesUrl("?season=2"),
    });
    await waitFor(() =>
      expect(page.result.current.read.matches).toHaveLength(1),
    );

    const requests = matchesRequests(get);
    expect(requests).toHaveLength(1);
    expect(requests[0].searchParams.get("season")).toBe("2");
    expect(
      new URLSearchParams(page.result.current.location.search).get("season"),
    ).toBe("2");
  });
});
