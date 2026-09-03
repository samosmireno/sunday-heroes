import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { CompetitionType, Role } from "@repo/shared-types";
import axiosInstance from "@/config/axios-config";
import { axiosResponse, createTestProviders } from "@/test/harness";
import {
  competitionInfo,
  competitionResponse,
  leagueMatchResponse,
  leaguePlayerTotals,
  leagueTeamResponse,
  matchPageResponse,
  matchResponse,
  seasonResponse,
} from "@/test/fixtures";
import { useCompleteMatch } from "./use-complete-match";

const competitionId = "comp-1";
const userId = "user-1";
const matchId = "fixture-1";

/** The League page, with a query client to look at the cache it shares with the other pages. */
const renderLeaguePage = () =>
  renderHook(
    () => ({
      complete: useCompleteMatch(competitionId),
      queryClient: useQueryClient(),
    }),
    { wrapper: createTestProviders() },
  );

describe("useCompleteMatch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("after Mark as completed, refreshes every read that the completed Fixture changed", async () => {
    const post = vi
      .spyOn(axiosInstance, "post")
      .mockResolvedValue(axiosResponse({}));
    const leaguePage = renderLeaguePage();
    const { queryClient } = leaguePage.result.current;

    // What the League page's tabs, the Season card and All Matches had read
    // before the click. Each read is keyed on the selected season too
    // (undefined is the Current season) and the mutation invalidates by
    // prefix, so a past season's tab refreshes along with the Current one.
    const standingsKey = ["leagueStandings", competitionId, undefined];
    const pastStandingsKey = ["leagueStandings", competitionId, 1];
    const statsKey = ["leagueStats", { competitionId, season: undefined }];
    const infoKey = ["competitionInfo", competitionId, userId];
    const competitionKey = [
      "competition",
      { compId: competitionId, userId, season: undefined },
    ];
    const fixturesKey = ["leagueFixtures", competitionId, undefined];
    const matchDetailsKey = ["leagueFixtures", matchId];
    const matchesKey = [
      "matches",
      { userId, competitionId, page: 1, season: undefined },
    ];
    queryClient.setQueryData(standingsKey, [
      leagueTeamResponse({ id: "team-1", name: "Lions", played: 1 }),
    ]);
    queryClient.setQueryData(pastStandingsKey, [
      leagueTeamResponse({ id: "team-1", name: "Lions", played: 6 }),
    ]);
    queryClient.setQueryData(statsKey, [
      leaguePlayerTotals({ nickname: "Ana", matches: 1 }),
    ]);
    queryClient.setQueryData(
      infoKey,
      competitionInfo({
        type: CompetitionType.LEAGUE,
        userRole: Role.ADMIN,
        seasons: [seasonResponse({ matchCount: 6, completedMatchCount: 1 })],
      }),
    );
    queryClient.setQueryData(
      competitionKey,
      competitionResponse({ type: CompetitionType.LEAGUE }),
    );
    queryClient.setQueryData(fixturesKey, [
      leagueMatchResponse({ id: matchId }),
    ]);
    queryClient.setQueryData(
      matchDetailsKey,
      matchResponse({ id: matchId, isCompleted: false }),
    );
    queryClient.setQueryData(matchesKey, {
      data: [matchPageResponse({ id: matchId, competitionId })],
      totalCount: 1,
      totalPages: 1,
    });

    act(() => leaguePage.result.current.complete.mutate(matchId));
    await waitFor(() =>
      expect(leaguePage.result.current.complete.isSuccess).toBe(true),
    );

    expect(post).toHaveBeenCalledWith(
      `/api/leagues/${competitionId}/matches/${matchId}/complete`,
    );
    for (const key of [
      standingsKey,
      pastStandingsKey,
      statsKey,
      infoKey,
      competitionKey,
      fixturesKey,
      matchDetailsKey,
      matchesKey,
    ]) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
    }
  });

  it("leaves the reads a completed Fixture does not change alone", async () => {
    vi.spyOn(axiosInstance, "post").mockResolvedValue(axiosResponse({}));
    const leaguePage = renderLeaguePage();
    const { queryClient } = leaguePage.result.current;

    // Another Competition's League page, and this one's Teams setup.
    const untouchedKeys: QueryKey[] = [
      ["leagueStandings", "comp-2", undefined],
      ["leagueFixtures", "comp-2", undefined],
      ["leagueFixtures", "fixture-2"],
      ["competitionTeams", competitionId],
    ];
    for (const key of untouchedKeys) {
      queryClient.setQueryData(key, {});
    }

    act(() => leaguePage.result.current.complete.mutate(matchId));
    await waitFor(() =>
      expect(leaguePage.result.current.complete.isSuccess).toBe(true),
    );

    for (const key of untouchedKeys) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(false);
    }
  });
});
