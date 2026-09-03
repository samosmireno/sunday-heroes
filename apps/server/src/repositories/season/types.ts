import { Season } from "@prisma/client";

export interface SeasonWithCounts extends Season {
  matchCount: number;
  completedMatchCount: number;
}

/** The Current season is the one Season of a Competition with no end date. */
export function isCurrentSeason(season: Pick<Season, "endedAt">): boolean {
  return season.endedAt === null;
}
