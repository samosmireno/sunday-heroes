import { Season } from "@prisma/client";

export interface SeasonWithMatchCount extends Season {
  matchCount: number;
}

export interface SeasonWithCounts extends SeasonWithMatchCount {
  completedMatchCount: number;
}

/** The Current season is the one Season of a Competition with no end date. */
export function isCurrentSeason(season: Pick<Season, "endedAt">): boolean {
  return season.endedAt === null;
}
