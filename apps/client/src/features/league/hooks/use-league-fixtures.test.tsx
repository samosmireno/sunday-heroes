import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { axiosResponse, createTestProviders } from "@/test/harness";
import { leagueMatchResponse, matchResponse } from "@/test/fixtures";
import { SeasonParam } from "@/features/competition/use-season-param";
import { useLeagueFixtures } from "./use-league-fixtures";
import { useMatchDetails } from "./use-match-details";

const competitionId = "comp-1";

const requestedSeason = (url: string) =>
  new URL(url).searchParams.get("season");

/** Season 1 is a Past season with two rounds; Season 2 is the Current season. */
const s1r1 = leagueMatchResponse({
  id: "s1r1",
  round: 1,
  season: { number: 1, isClosed: true },
});
const s1r2 = leagueMatchResponse({
  id: "s1r2",
  round: 2,
  season: { number: 1, isClosed: true },
});
const s2r1 = leagueMatchResponse({
  id: "s2r1",
  round: 1,
  season: { number: 2, isClosed: false },
});

describe("useLeagueFixtures", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes the season to the server verbatim, keys the read on it, and regroups by round for one Season and by season for All seasons", async () => {
    const get = vi
      .spyOn(axios, "get")
      .mockResolvedValueOnce(axiosResponse([s1r1, s1r2]))
      .mockResolvedValueOnce(axiosResponse([s2r1, s1r1, s1r2]));
    const wrapper = createTestProviders();

    const page = renderHook(
      ({ season }: { season: SeasonParam }) => ({
        read: useLeagueFixtures(competitionId, season),
        queryClient: useQueryClient(),
      }),
      { wrapper, initialProps: { season: 1 as SeasonParam } },
    );
    await waitFor(() =>
      expect(page.result.current.read.leagueFixtures).toBeDefined(),
    );

    expect(requestedSeason(get.mock.calls[0][0])).toBe("1");
    expect(page.result.current.read.leagueFixtures).toEqual({
      view: "rounds",
      rounds: { 1: [s1r1], 2: [s1r2] },
    });
    expect(
      page.result.current.queryClient.getQueryData([
        "leagueFixtures",
        competitionId,
        1,
      ]),
    ).toEqual([s1r1, s1r2]);

    page.rerender({ season: "all" });
    await waitFor(() =>
      expect(page.result.current.read.leagueFixtures?.view).toBe("seasons"),
    );

    expect(requestedSeason(get.mock.calls[1][0])).toBe("all");
    expect(page.result.current.read.leagueFixtures).toEqual({
      view: "seasons",
      seasons: [
        { season: { number: 2, isClosed: false }, rounds: { 1: [s2r1] } },
        {
          season: { number: 1, isClosed: true },
          rounds: { 1: [s1r1], 2: [s1r2] },
        },
      ],
    });
  });

  it("asks for the Current season by sending no season", async () => {
    const get = vi.spyOn(axios, "get").mockResolvedValue(axiosResponse([s2r1]));

    const { result } = renderHook(
      () => useLeagueFixtures(competitionId, undefined),
      { wrapper: createTestProviders() },
    );
    await waitFor(() => expect(result.current.leagueFixtures).toBeDefined());

    expect(requestedSeason(get.mock.calls[0][0])).toBeNull();
    expect(result.current.leagueFixtures).toEqual({
      view: "rounds",
      rounds: { 1: [s2r1] },
    });
  });

  it("shares the leagueFixtures key prefix with the match-details read without the two clashing", async () => {
    vi.spyOn(axios, "get").mockImplementation(async (url: string) =>
      url.includes("/fixtures")
        ? axiosResponse([s2r1])
        : axiosResponse(matchResponse({ id: "s2r1" })),
    );

    const page = renderHook(
      () => ({
        fixtures: useLeagueFixtures(competitionId, undefined),
        details: useMatchDetails("s2r1"),
        queryClient: useQueryClient(),
      }),
      { wrapper: createTestProviders() },
    );
    await waitFor(() =>
      expect(page.result.current.details.match?.id).toBe("s2r1"),
    );
    await waitFor(() =>
      expect(page.result.current.fixtures.leagueFixtures?.view).toBe("rounds"),
    );

    const { queryClient } = page.result.current;
    expect(queryClient.getQueryData(["leagueFixtures", "s2r1"])).toMatchObject({
      id: "s2r1",
      teams: ["Home", "Away"],
    });
    expect(
      queryClient.getQueryData(["leagueFixtures", competitionId, undefined]),
    ).toEqual([s2r1]);
  });
});
