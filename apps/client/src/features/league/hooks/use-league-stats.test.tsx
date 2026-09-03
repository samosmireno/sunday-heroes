import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { axiosResponse, createTestProviders } from "@/test/harness";
import { leaguePlayerTotals } from "@/test/fixtures";
import { useLeagueStats } from "./use-league-stats";

const competitionId = "comp-1";

const requestedSeason = (url: string) =>
  new URL(url).searchParams.get("season");

const ana = leaguePlayerTotals({
  nickname: "Ana",
  matches: 4,
  goals: 5,
  assists: 1,
  rating: 7.5,
});
const bo = leaguePlayerTotals({
  nickname: "Bo",
  matches: 4,
  goals: 2,
  assists: 4,
  rating: 8.1,
});

describe("useLeagueStats", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes the selected season to the server verbatim, keys the read on it, and ranks the top performers from the totals it answers", async () => {
    const get = vi
      .spyOn(axios, "get")
      .mockResolvedValue(axiosResponse([ana, bo]));
    const wrapper = createTestProviders();

    const page = renderHook(
      () => ({
        read: useLeagueStats(competitionId, 2),
        queryClient: useQueryClient(),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(page.result.current.read.players).toHaveLength(2),
    );

    expect(requestedSeason(get.mock.calls[0][0])).toBe("2");
    expect(
      page.result.current.queryClient.getQueryData([
        "leagueStats",
        { competitionId, season: 2 },
      ]),
    ).toEqual([ana, bo]);
    expect(page.result.current.read).toMatchObject({
      topScorer: { nickname: "Ana" },
      topAssister: { nickname: "Bo" },
      topRated: { nickname: "Bo" },
    });
  });
});
