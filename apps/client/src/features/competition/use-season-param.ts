import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SeasonFilter, SeasonResponse } from "@repo/shared-types";

/** A season selection: one Season by number, or "all" for All seasons. */
export type SeasonSelection = SeasonFilter;

/** The season a read takes: a selection, or undefined for the Current season. */
export type SeasonParam = SeasonSelection | undefined;

const SEASON_NUMBER = /^[1-9]\d*$/;
const NO_SEASONS: SeasonResponse[] = [];

/**
 * The `?season=` value as the reads take it. "all" and a positive whole
 * number pass through verbatim; anything else counts as absent, since the
 * server would only refuse it.
 */
export function parseSeasonParam(raw: string | null): SeasonParam {
  if (raw === "all") return "all";
  if (raw !== null && SEASON_NUMBER.test(raw)) return Number(raw);
  return undefined;
}

/** The season selection every season-aware view reads. */
export interface SeasonSelectionState {
  /** The URL value for the query keys and requests; undefined means the Current season. */
  season: SeasonParam;
  /**
   * The resolved selection. Once the season list is known, an unknown value
   * resolves to the Current season; before that it is the raw `season`.
   */
  selection: SeasonSelection | undefined;
  /** The Current season's number, once the season list is known. */
  current: number | undefined;
  seasons: SeasonResponse[];
  /** The selected Season, when the selection is one Season of the list. */
  selectedSeason: SeasonResponse | undefined;
  isPast: boolean;
  isAll: boolean;
  /** A single Season needs no selector. */
  showSelector: boolean;
}

/**
 * The season selection in the URL: `?season=2`, `?season=all`, or absent for
 * the Current season. Selecting the Current season removes the param; any
 * change drops `?round=` (rounds are per season) and keeps everything else.
 * Once the season list has arrived, an unknown or malformed value is replaced
 * out of the URL so the page shows the Current season and the back button
 * never returns to the bad URL.
 */
export function useSeasonParam(seasons: SeasonResponse[] = NO_SEASONS) {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get("season");
  const season = parseSeasonParam(raw);

  const listKnown = seasons.length > 0;
  const current = seasons.find((s) => s.endedAt === null)?.number;
  const selectionKnown =
    season === "all" ||
    (season !== undefined && seasons.some((s) => s.number === season));
  const selection = listKnown ? (selectionKnown ? season : current) : season;
  const selectedSeason =
    typeof selection === "number"
      ? seasons.find((s) => s.number === selection)
      : undefined;

  useEffect(() => {
    if (!listKnown || raw === null || selectionKnown) return;
    const params = new URLSearchParams(searchParams);
    params.delete("season");
    setSearchParams(params, { replace: true });
  }, [listKnown, raw, selectionKnown, searchParams, setSearchParams]);

  const setSelection = useCallback(
    (next: SeasonSelection) => {
      const params = new URLSearchParams(searchParams);
      if (next === current) params.delete("season");
      else params.set("season", String(next));
      params.delete("round");
      setSearchParams(params);
    },
    [searchParams, setSearchParams, current],
  );

  const state: SeasonSelectionState = {
    season,
    selection,
    current,
    seasons,
    selectedSeason,
    isPast: selectedSeason !== undefined && selectedSeason.endedAt !== null,
    isAll: selection === "all",
    showSelector: seasons.length > 1,
  };

  return { ...state, setSelection };
}
