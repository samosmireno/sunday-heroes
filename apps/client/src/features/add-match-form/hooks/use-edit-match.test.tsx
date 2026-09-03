import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import { CompetitionType } from "@repo/shared-types";
import axiosInstance from "@/config/axios-config";
import { useCompetition } from "@/features/competition/use-competition";
import { axiosResponse, createTestProviders } from "@/test/harness";
import {
  competitionResponse,
  duelFormData,
  matchResponse,
} from "@/test/fixtures";
import { useEditMatch } from "./use-edit-match";

const competitionId = "comp-1";
const userId = "user-1";
const matchId = "match-1";

describe("useEditMatch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the edited result on the competition page after editing a match", async () => {
    // The server reports the match as 2-1 on the first visit and 3-1 on the return.
    vi.spyOn(axios, "get")
      .mockResolvedValueOnce(
        axiosResponse(
          competitionResponse({
            matches: [matchResponse({ id: matchId, homeTeamScore: 2 })],
          }),
        ),
      )
      .mockResolvedValue(
        axiosResponse(
          competitionResponse({
            matches: [matchResponse({ id: matchId, homeTeamScore: 3 })],
          }),
        ),
      );
    vi.spyOn(axiosInstance, "get").mockResolvedValue(
      axiosResponse(matchResponse({ id: matchId, homeTeamScore: 2 })),
    );
    vi.spyOn(axiosInstance, "patch").mockResolvedValue(
      axiosResponse({ id: matchId }),
    );
    const wrapper = createTestProviders();

    const firstVisit = renderHook(() => useCompetition(competitionId, userId), {
      wrapper,
    });
    await waitFor(() =>
      expect(
        firstVisit.result.current.competition?.matches[0].homeTeamScore,
      ).toBe(2),
    );
    firstVisit.unmount();

    const editMatchPage = renderHook(
      () => useEditMatch(CompetitionType.DUEL, competitionId, matchId),
      { wrapper },
    );
    await waitFor(() =>
      expect(editMatchPage.result.current.isLoading).toBe(false),
    );
    act(() =>
      editMatchPage.result.current.handleSubmit(
        duelFormData({ homeTeamScore: 3 }),
      ),
    );
    await waitFor(() =>
      expect(editMatchPage.result.current.isSubmitting).toBe(false),
    );
    editMatchPage.unmount();

    const returnVisit = renderHook(
      () => useCompetition(competitionId, userId),
      { wrapper },
    );
    await waitFor(() =>
      expect(
        returnVisit.result.current.competition?.matches[0].homeTeamScore,
      ).toBe(3),
    );
  });
});
