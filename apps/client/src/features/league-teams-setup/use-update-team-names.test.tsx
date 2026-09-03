import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import { CompetitionType } from "@repo/shared-types";
import axiosInstance from "@/config/axios-config";
import { useCompetition } from "@/features/competition/use-competition";
import { axiosResponse, createTestProviders } from "@/test/harness";
import { competitionResponse, matchResponse } from "@/test/fixtures";
import { useUpdateTeamNames } from "./use-update-team-names";

const competitionId = "comp-1";
const userId = "user-1";

describe("useUpdateTeamNames", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
