import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { axiosResponse, createTestProviders } from "@/test/harness";
import { competitionResponse, matchResponse } from "@/test/fixtures";
import { SeasonParam } from "./use-season-param";
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
});
