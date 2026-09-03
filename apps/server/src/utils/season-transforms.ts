import {
  CurrentSeasonResponse,
  MatchSeason,
  SeasonResponse,
} from "@repo/shared-types";
import {
  isCurrentSeason,
  SeasonWithCounts,
} from "../repositories/season/types";

/** The season tag a Match carries: its number, and whether that Season is closed. */
export function transformMatchSeasonToResponse(season: {
  number: number;
  endedAt: Date | null;
}): MatchSeason {
  return { number: season.number, isClosed: !isCurrentSeason(season) };
}

export function transformSeasonToResponse(
  season: SeasonWithCounts,
): SeasonResponse {
  return {
    number: season.number,
    startedAt: season.startedAt.toISOString(),
    endedAt: season.endedAt ? season.endedAt.toISOString() : null,
    matchCount: season.matchCount,
    completedMatchCount: season.completedMatchCount,
  };
}

export function transformCurrentSeasonToResponse(
  season: SeasonWithCounts,
  counts: { notCompletedCount: number; openVotingCount: number },
): CurrentSeasonResponse {
  return { ...transformSeasonToResponse(season), ...counts };
}
