import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SeasonFilter, SeasonResponse } from "@repo/shared-types";

/** The season a read takes: one Season by number, "all", or undefined for the Current season. */
export type SeasonParam = SeasonFilter | undefined;

const SEASON_NUMBER = /^[1-9]\d*$/;
const NO_SEASONS: SeasonResponse[] = [];

/** The Current season is the one Season of a Competition with no end date. */
export function isCurrentSeason(season: Pick<SeasonResponse, "endedAt">) {
  return season.endedAt === null;
}

/** The Current season of a season list, once the list is known. */
export function currentSeasonOf(
  seasons: SeasonResponse[],
): SeasonResponse | undefined {
  return seasons.find(isCurrentSeason);
}

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

/** The `season` query entry a read sends: none for the Current season. */
export function seasonQuery(season: SeasonParam): Record<string, string> {
  return season === undefined ? {} : { season: String(season) };
}

/** A read's URL with the season selection appended, untouched for the Current season. */
export function withSeasonQuery(url: string, season: SeasonParam): string {
  const query = new URLSearchParams(seasonQuery(season)).toString();
  return query ? `${url}?${query}` : url;
}

/** The season selection every season-aware view reads. */
export interface SeasonSelectionState {
  /** The URL value for the query keys and requests; undefined means the Current season. */
  season: SeasonParam;
  /**
   * The resolved selection. Once the season list is known, an unknown value
   * resolves to the Current season; before that it is the raw `season`.
   */
  selection: SeasonFilter | undefined;
  /** The Current season's number, once the season list is known. */
  current: number | undefined;
  seasons: SeasonResponse[];
  /** The selected Season, when the selection is one Season of the list. */
  selectedSeason: SeasonResponse | undefined;
  /**
   * The Matches the selection covers: one Season's count, or the sum over
   * every Season under All seasons; undefined until the list is known.
   */
  selectedMatchCount: number | undefined;
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
  const current = currentSeasonOf(seasons)?.number;
  const selectionKnown =
    season === "all" ||
    (season !== undefined && seasons.some((s) => s.number === season));
  const selection = listKnown ? (selectionKnown ? season : current) : season;
  const selectedSeason =
    typeof selection === "number"
      ? seasons.find((s) => s.number === selection)
      : undefined;
  const selectedMatchCount =
    selection === "all"
      ? listKnown
        ? seasons.reduce((count, s) => count + s.matchCount, 0)
        : undefined
      : selectedSeason?.matchCount;

  useEffect(() => {
    if (!listKnown || raw === null || selectionKnown) return;
    const params = new URLSearchParams(searchParams);
    params.delete("season");
    setSearchParams(params, { replace: true });
  }, [listKnown, raw, selectionKnown, searchParams, setSearchParams]);

  const setSelection = useCallback(
    (next: SeasonFilter) => {
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
    selectedMatchCount,
    isPast: selectedSeason !== undefined && !isCurrentSeason(selectedSeason),
    isAll: selection === "all",
    showSelector: seasons.length > 1,
  };

  return { ...state, setSelection };
}
