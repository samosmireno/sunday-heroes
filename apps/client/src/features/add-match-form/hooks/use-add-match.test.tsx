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
import { useAddMatch } from "./use-add-match";

const competitionId = "comp-1";
const userId = "user-1";

describe("useAddMatch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the new match on the competition page after adding a Duel match", async () => {
    // The server has no matches on the first visit and the added one on the return.
    vi.spyOn(axios, "get")
      .mockResolvedValueOnce(
        axiosResponse(competitionResponse({ matches: [] })),
      )
      .mockResolvedValue(
        axiosResponse(
          competitionResponse({ matches: [matchResponse({ id: "match-1" })] }),
        ),
      );
    vi.spyOn(axiosInstance, "post").mockResolvedValue(
      axiosResponse({ id: "match-1" }),
    );
    const wrapper = createTestProviders();

    const firstVisit = renderHook(() => useCompetition(competitionId, userId), {
      wrapper,
    });
    await waitFor(() =>
      expect(firstVisit.result.current.competition?.matches).toEqual([]),
    );
    firstVisit.unmount();

    const addMatchPage = renderHook(
      () => useAddMatch(CompetitionType.DUEL, competitionId),
      { wrapper },
    );
    act(() => addMatchPage.result.current.handleSubmit(duelFormData()));
    await waitFor(() =>
      expect(addMatchPage.result.current.isSubmitting).toBe(false),
    );
    addMatchPage.unmount();

    const returnVisit = renderHook(
      () => useCompetition(competitionId, userId),
      { wrapper },
    );
    await waitFor(() =>
      expect(
        returnVisit.result.current.competition?.matches.map((m) => m.id),
      ).toEqual(["match-1"]),
    );
  });
});
