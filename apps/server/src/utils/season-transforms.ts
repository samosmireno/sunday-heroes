import { CurrentSeasonResponse, SeasonResponse } from "@repo/shared-types";
import { SeasonWithCounts } from "../repositories/season/types";

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
