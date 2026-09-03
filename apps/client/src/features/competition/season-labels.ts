import { SeasonFilter, SeasonResponse } from "@repo/shared-types";
import { format } from "date-fns";

const day = (iso: string) => format(new Date(iso), "d MMM yyyy");
const month = (iso: string) => format(new Date(iso), "MMM yy");

export const ALL_SEASONS_LABEL = "All seasons";

export const seasonName = (number: number) => `Season ${number}`;

/** `2 Mar 2025 – 14 Sep 2025`, or `since 14 Sep 2025` for the Current season. */
export function seasonDatesLabel(season: SeasonResponse): string {
  return season.endedAt
    ? `${day(season.startedAt)} – ${day(season.endedAt)}`
    : `since ${day(season.startedAt)}`;
}

/** The open list's option: `Season 2 · 2 Mar 2025 – 14 Sep 2025`. */
export function seasonOptionLabel(season: SeasonResponse): string {
  return `${seasonName(season.number)} · ${seasonDatesLabel(season)}`;
}

/** The closed trigger: `Season 3 · current` or `Season 2 · Mar 25 – Sep 25`. */
export function seasonTriggerLabel(season: SeasonResponse): string {
  const detail = season.endedAt
    ? `${month(season.startedAt)} – ${month(season.endedAt)}`
    : "current";
  return `${seasonName(season.number)} · ${detail}`;
}

/** `All seasons · 3 seasons` */
export function allSeasonsOptionLabel(count: number): string {
  return `${ALL_SEASONS_LABEL} · ${count} seasons`;
}

export interface PastSeasonBannerCopy {
  message: string;
  backButton: string;
}

/** The banner over a Past season's views, and its way back to the Current season. */
export function pastSeasonBanner(
  season: SeasonResponse,
  current: number,
): PastSeasonBannerCopy {
  const closed = season.endedAt ? ` · closed ${day(season.endedAt)}` : "";
  return {
    message: `${seasonName(season.number)}${closed}. Matches from a past season can be viewed but not changed.`,
    backButton: `Back to ${seasonName(current)}`,
  };
}

/** Which matches the Duel stats table's percentage filter counts. */
export function duelStatsCaption(
  selection: SeasonFilter,
  matchCount: number,
): string {
  const scope = selection === "all" ? ALL_SEASONS_LABEL : seasonName(selection);
  const matches = matchCount === 1 ? "1 match" : `${matchCount} matches`;
  const these = matchCount === 1 ? "this" : "these";
  return `${scope} · ${matches}. Min. matches % is a share of ${these} ${matchCount}.`;
}

/** In place of Add Match on a Past season. */
export function addMatchHint(current: number): string {
  return `New matches go to ${seasonName(current)}`;
}
