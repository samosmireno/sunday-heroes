import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  CompetitionType,
  Role,
  UpdateTeamNamesResponse,
} from "@repo/shared-types";
import axiosInstance from "@/config/axios-config";
import { useCompetition } from "@/features/competition/use-competition";
import { axiosResponse, createTestProviders } from "@/test/harness";
import {
  competitionInfo,
  competitionResponse,
  matchResponse,
  seasonResponse,
} from "@/test/fixtures";
import { useUpdateTeamNames } from "./use-update-team-names";

const competitionId = "comp-1";
const userId = "user-1";

const teamUpdates = [
  { id: "team-1", name: "Lions" },
  { id: "team-2", name: "Tigers" },
];

const saved: UpdateTeamNamesResponse = {
  success: true,
  updatedTeams: 2,
  updates: teamUpdates,
  fixturesGenerated: 1,
};

describe("useUpdateTeamNames", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("after a save, refreshes the teams, info and Fixtures reads and lands on the League page", async () => {
    vi.spyOn(axiosInstance, "patch").mockResolvedValue(axiosResponse(saved));
    const wrapper = createTestProviders();

    const teamsSetupPage = renderHook(
      () => ({
        save: useUpdateTeamNames(),
        queryClient: useQueryClient(),
        location: useLocation(),
      }),
      { wrapper },
    );
    // What the router and the League page had read before Teams setup.
    const { queryClient } = teamsSetupPage.result.current;
    const teamsKey = ["competitionTeams", competitionId];
    const infoKey = ["competitionInfo", competitionId, userId];
    // The fixtures read is keyed on the season too; the save invalidates by prefix.
    const currentFixturesKey = ["leagueFixtures", competitionId, undefined];
    const pastFixturesKey = ["leagueFixtures", competitionId, 1];
    queryClient.setQueryData(teamsKey, {
      id: competitionId,
      name: "Sunday League",
      type: CompetitionType.LEAGUE,
      votingEnabled: false,
      teams: [
        { id: "team-1", name: "team-4821" },
        { id: "team-2", name: "team-93" },
      ],
    });
    queryClient.setQueryData(
      infoKey,
      competitionInfo({
        type: CompetitionType.LEAGUE,
        userRole: Role.ADMIN,
        seasons: [seasonResponse({ number: 2, matchCount: 0 })],
      }),
    );
    queryClient.setQueryData(currentFixturesKey, {});
    queryClient.setQueryData(pastFixturesKey, {});

    act(() =>
      teamsSetupPage.result.current.save.mutate({ competitionId, teamUpdates }),
    );
    await waitFor(() =>
      expect(teamsSetupPage.result.current.save.isSuccess).toBe(true),
    );

    for (const key of [
      teamsKey,
      infoKey,
      currentFixturesKey,
      pastFixturesKey,
    ]) {
      expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
    }
    expect(teamsSetupPage.result.current.location.pathname).toBe(
      `/competition/${competitionId}`,
    );
  });

  it("shows the renamed teams on the competition page after saving Teams setup", async () => {
    // The server names the teams by their defaults on the first visit and by the saved names on the return.
    const leagueWithTeams = (teams: string[]) =>
      competitionResponse({
        type: CompetitionType.LEAGUE,
        matches: [matchResponse({ teams, isCompleted: false })],
      });
    vi.spyOn(axios, "get")
      .mockResolvedValueOnce(
        axiosResponse(leagueWithTeams(["Team 1", "Team 2"])),
      )
      .mockResolvedValue(axiosResponse(leagueWithTeams(["Lions", "Tigers"])));
    vi.spyOn(axiosInstance, "patch").mockResolvedValue(axiosResponse({}));
    const wrapper = createTestProviders();

    const firstVisit = renderHook(() => useCompetition(competitionId, userId), {
      wrapper,
    });
    await waitFor(() =>
      expect(firstVisit.result.current.competition?.matches[0].teams).toEqual([
        "Team 1",
        "Team 2",
      ]),
    );
    firstVisit.unmount();

    const teamsSetupPage = renderHook(() => useUpdateTeamNames(), { wrapper });
    act(() =>
      teamsSetupPage.result.current.mutate({
        competitionId,
        teamUpdates: [
          { id: "team-1", name: "Lions" },
          { id: "team-2", name: "Tigers" },
        ],
      }),
    );
    await waitFor(() =>
      expect(teamsSetupPage.result.current.isPending).toBe(false),
    );
    teamsSetupPage.unmount();

    const returnVisit = renderHook(
      () => useCompetition(competitionId, userId),
      { wrapper },
    );
    await waitFor(() =>
      expect(returnVisit.result.current.competition?.matches[0].teams).toEqual([
        "Lions",
        "Tigers",
      ]),
    );
  });
});
