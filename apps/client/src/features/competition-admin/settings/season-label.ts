import { SeasonResponse } from "@repo/shared-types";
import { format } from "date-fns";

/** `Current season: Season 3 · started 12 Sep 2025` */
export function currentSeasonLabel(season: SeasonResponse): string {
  const started = format(new Date(season.startedAt), "d MMM yyyy");
  return `Current season: Season ${season.number} · started ${started}`;
}
