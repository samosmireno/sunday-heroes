import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { MatchPageResponse } from "@repo/shared-types";
import { axiosResponse, createTestProviders } from "@/test/harness";
import { matchPageResponse } from "@/test/fixtures";
import { SeasonParam } from "@/features/competition/use-season-param";
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
});
