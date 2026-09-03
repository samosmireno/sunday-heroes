/**
 * A Season as every competition read carries it. No id: the URL, the season
 * filter and the per-match tag all use the number.
 */
export type SeasonResponse = {
  number: number;
  /** ISO timestamp of the admin's act that opened the Season. */
  startedAt: string;
  /** ISO timestamp of the act that closed it; null for the Current season. */
  endedAt: string | null;
  matchCount: number;
  completedMatchCount: number;
};

/** The Current season with the counts the Settings tab and its dialog need. */
export type CurrentSeasonResponse = SeasonResponse & {
  /** Matches of the Current season not yet marked completed. */
  notCompletedCount: number;
  /** Matches of the Current season whose voting is still open. */
  openVotingCount: number;
};

/** A season number, or "all" for the whole of a Competition's history. */
export type SeasonFilter = number | "all";

/** The season tag a Match carries. */
export type MatchSeason = {
  number: number;
  isClosed: boolean;
};
