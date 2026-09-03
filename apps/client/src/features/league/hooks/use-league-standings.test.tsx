import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { axiosResponse, createTestProviders } from "@/test/harness";
import { leagueTeamResponse } from "@/test/fixtures";
import { SeasonParam } from "@/features/competition/use-season-param";
import { useLeagueStandings } from "./use-league-standings";

const competitionId = "comp-1";

const requestedSeason = (url: string) =>
  new URL(url).searchParams.get("season");

describe("useLeagueStandings", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes the selected season to the server verbatim and keys the read on it", async () => {
    const get = vi
      .spyOn(axios, "get")
      .mockResolvedValue(
        axiosResponse([
          leagueTeamResponse({ id: "team-lions", name: "Lions" }),
        ]),
      );
    const wrapper = createTestProviders();

    const page = renderHook(
      () => ({
        read: useLeagueStandings(competitionId, 2),
        queryClient: useQueryClient(),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(page.result.current.read.leagueStandings).toHaveLength(1),
    );

    expect(requestedSeason(get.mock.calls[0][0])).toBe("2");
    expect(
      page.result.current.queryClient.getQueryData([
        "leagueStandings",
        competitionId,
        2,
      ]),
    ).toMatchObject([{ id: "team-lions" }]);
  });

  it("asks for the Current season by sending no season, and for All seasons as 'all'", async () => {
    const get = vi.spyOn(axios, "get").mockResolvedValue(axiosResponse([]));
    const wrapper = createTestProviders();

    const page = renderHook(
      ({ season }: { season: SeasonParam }) =>
        useLeagueStandings(competitionId, season),
      { wrapper, initialProps: { season: undefined as SeasonParam } },
    );
    await waitFor(() =>
      expect(page.result.current.leagueStandings).toBeDefined(),
    );
    expect(requestedSeason(get.mock.calls[0][0])).toBeNull();

    page.rerender({ season: "all" });
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
    expect(requestedSeason(get.mock.calls[1][0])).toBe("all");
  });
});
