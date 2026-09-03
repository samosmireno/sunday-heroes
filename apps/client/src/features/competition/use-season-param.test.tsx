import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { SeasonResponse } from "@repo/shared-types";
import { seasonResponse } from "@/test/fixtures";
import { useSeasonParam } from "./use-season-param";

/** Seasons 1 and 2 are Past seasons; Season 3 is the Current season. */
const threeSeasons: SeasonResponse[] = [
  seasonResponse({
    number: 1,
    startedAt: "2024-09-08T10:00:00.000Z",
    endedAt: "2025-03-02T10:00:00.000Z",
    matchCount: 10,
  }),
  seasonResponse({
    number: 2,
    startedAt: "2025-03-02T10:00:00.000Z",
    endedAt: "2025-09-14T10:00:00.000Z",
    matchCount: 25,
  }),
  seasonResponse({
    number: 3,
    startedAt: "2025-09-14T10:00:00.000Z",
    endedAt: null,
    matchCount: 4,
  }),
];

/**
 * The hook at a competition URL, with the location alongside so a test can
 * watch what the hook does to the URL. No React Query: the season list is a
 * prop, absent until a test says it has arrived.
 */
function renderSeasonParam(search: string, seasons?: SeasonResponse[]) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[`/competition/comp-1${search}`]}>
      {children}
    </MemoryRouter>
  );
  return renderHook(
    ({ seasons }: { seasons?: SeasonResponse[] }) => ({
      ...useSeasonParam(seasons),
      location: useLocation(),
      navigate: useNavigate(),
    }),
    { wrapper, initialProps: { seasons } },
  );
}

const searchOf = (result: { location: { search: string } }) =>
  new URLSearchParams(result.location.search);

describe("useSeasonParam", () => {
  it("an absent param means the Current season", () => {
    const { result } = renderSeasonParam("", threeSeasons);

    expect(result.current).toMatchObject({
      season: undefined,
      selection: 3,
      current: 3,
      isPast: false,
      isAll: false,
      showSelector: true,
    });
  });

  it("?season=2 selects that Past season", () => {
    const { result } = renderSeasonParam("?season=2", threeSeasons);

    expect(result.current).toMatchObject({
      season: 2,
      selection: 2,
      isPast: true,
      isAll: false,
    });
    expect(result.current.selectedSeason?.matchCount).toBe(25);
  });

  it("?season=all selects All seasons", () => {
    const { result } = renderSeasonParam("?season=all", threeSeasons);

    expect(result.current).toMatchObject({
      season: "all",
      selection: "all",
      isPast: false,
      isAll: true,
      selectedSeason: undefined,
    });
  });

  it("passes the raw value to the reads before the season list arrives", () => {
    const past = renderSeasonParam("?season=2");
    expect(past.result.current).toMatchObject({
      season: 2,
      selection: 2,
      current: undefined,
      showSelector: false,
    });

    const all = renderSeasonParam("?season=all");
    expect(all.result.current.season).toBe("all");
  });

  it("drops an unknown season number from the URL once the list arrives and shows the Current season", () => {
    const { result, rerender } = renderSeasonParam("?season=9&tab=fixtures");
    expect(result.current.season).toBe(9);
    expect(searchOf(result.current).get("season")).toBe("9");

    rerender({ seasons: threeSeasons });

    expect(searchOf(result.current).has("season")).toBe(false);
    expect(searchOf(result.current).get("tab")).toBe("fixtures");
    expect(result.current).toMatchObject({ season: undefined, selection: 3 });

    // The bad URL was replaced, not pushed: going back does not return to it.
    act(() => result.current.navigate(-1));
    expect(searchOf(result.current).has("season")).toBe(false);
  });

  it.each(["abc", "0", "-1", "1.5", ""])(
    "treats the malformed value %j as absent from the first render and drops it once the list arrives",
    (bad) => {
      const { result, rerender } = renderSeasonParam(`?season=${bad}`);
      expect(result.current.season).toBeUndefined();
      expect(searchOf(result.current).has("season")).toBe(true);

      rerender({ seasons: threeSeasons });

      expect(searchOf(result.current).has("season")).toBe(false);
      expect(result.current.selection).toBe(3);
    },
  );

  it("hides the selector while the Competition has one Season", () => {
    const { result } = renderSeasonParam("", [seasonResponse({ number: 1 })]);

    expect(result.current).toMatchObject({
      showSelector: false,
      selection: 1,
      current: 1,
    });
  });

  it("selecting the Current season removes the param", () => {
    const { result } = renderSeasonParam(
      "?season=2&tab=stats&round=3",
      threeSeasons,
    );

    act(() => result.current.setSelection(3));

    expect(searchOf(result.current).has("season")).toBe(false);
    expect(searchOf(result.current).get("tab")).toBe("stats");
    expect(result.current.selection).toBe(3);
  });

  it("selecting a season sets the param, drops the round and keeps the tab", () => {
    const { result } = renderSeasonParam("?tab=fixtures&round=3", threeSeasons);

    act(() => result.current.setSelection(2));
    expect(searchOf(result.current).get("season")).toBe("2");
    expect(searchOf(result.current).get("tab")).toBe("fixtures");
    expect(searchOf(result.current).has("round")).toBe(false);
    expect(result.current.selection).toBe(2);

    act(() => result.current.setSelection("all"));
    expect(searchOf(result.current).get("season")).toBe("all");
    expect(result.current.isAll).toBe(true);
  });
});
