import { LeagueMatchResponse, MatchSeason } from "@repo/shared-types";
import { SeasonParam } from "@/features/competition/use-season-param";

/** One Season's Fixtures keyed by round number; `roundNumbers` lists the rounds in order. */
export type FixturesByRound = Record<number, LeagueMatchResponse[]>;

/** One Season's Fixtures within All seasons, under the Season tag its Matches carry. */
export interface SeasonFixtures {
  season: MatchSeason;
  rounds: FixturesByRound;
}

/**
 * The Fixtures tab's data: round tabs for one Season, or one list by season
 * newest first for All seasons.
 */
export type GroupedFixtures =
  | { view: "rounds"; rounds: FixturesByRound }
  | { view: "seasons"; seasons: SeasonFixtures[] };

/** Matches by round, each round in the order the list gives (the read's date order). */
export const groupByRound = (matches: LeagueMatchResponse[]): FixturesByRound =>
  matches.reduce<FixturesByRound>((acc, match) => {
    (acc[match.round] ??= []).push(match);
    return acc;
  }, {});

/** Matches by season newest first, each season by round. */
function groupBySeason(matches: LeagueMatchResponse[]): SeasonFixtures[] {
  const bySeason = new Map<number, LeagueMatchResponse[]>();
  for (const match of matches) {
    const season = bySeason.get(match.season.number) ?? [];
    season.push(match);
    bySeason.set(match.season.number, season);
  }
  return [...bySeason.values()]
    .map((season) => ({
      season: season[0].season,
      rounds: groupByRound(season),
    }))
    .sort((a, b) => b.season.number - a.season.number);
}

/** The fixtures read regrouped for the selection: by round for one Season, by season for All seasons. */
export function groupFixtures(
  matches: LeagueMatchResponse[],
  season: SeasonParam,
): GroupedFixtures {
  return season === "all"
    ? { view: "seasons", seasons: groupBySeason(matches) }
    : { view: "rounds", rounds: groupByRound(matches) };
}

/** The rounds of a Season in ascending order. */
export const roundNumbers = (rounds: FixturesByRound): number[] =>
  Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

/** A Season's matches in round order. */
export const matchesByRound = (
  rounds: FixturesByRound,
): LeagueMatchResponse[] =>
  roundNumbers(rounds).flatMap((round) => rounds[round]);
