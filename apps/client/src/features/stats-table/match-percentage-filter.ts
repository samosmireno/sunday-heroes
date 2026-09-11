/**
 * The fewest matches a player must have played to pass the "Min. matches %"
 * filter: `percent` of `totalMatches`, rounded up so a fraction of a match
 * counts as a whole one (50% of 3 is 2), never below 1 so an empty
 * denominator keeps "All" and the percentages apart.
 */
export function minMatchesForPercent(
  percent: number,
  totalMatches: number,
): number {
  return Math.max(1, Math.ceil((percent / 100) * totalMatches));
}

/** Whether a player with `matchesPlayed` matches passes the filter. */
export function playedAtLeastPercent(
  matchesPlayed: number,
  percent: number,
  totalMatches: number,
): boolean {
  return matchesPlayed >= minMatchesForPercent(percent, totalMatches);
}
