import { QueryClient, QueryKey } from "@tanstack/react-query";
import { SeasonParam } from "./use-season-param";

/**
 * The query keys of the Competition family: the Competition's own reads, the
 * League page's tabs and the match lists, along with the invalidation that
 * follows a write to the Competition. One shape per read, in one place: a
 * renamed key or a new season-carrying read is a change here rather than a
 * hunt through the mutation hooks.
 *
 * Three key conventions coexist, one per read family, and each is reproduced
 * verbatim; normalising them is a separate change. Every `*Prefix` is the
 * competition-wide head of its key: the partial key an invalidation targets so
 * that the read is caught whichever user or season it was cached under.
 *
 * The family is closed, and the reads outside it keep their keys inline: each
 * has one reader and no invalidator, so no second place has to agree on its
 * shape. That includes two searches that carry a Competition id without
 * belonging to the family, `playerSuggestions` in the match form's player list
 * and `user-search` in the moderators panel, as well as the player, dashboard,
 * player stats, voting and invitation reads.
 */

/** The scope of one match list: a user's, or one Competition's, one page at a time. */
export interface MatchListScope {
  userId: string;
  competitionId?: string;
  page: number;
  /** The selected season as the URL holds it, passed through verbatim. */
  season?: SeasonParam;
}

/** The Competition's own reads: the stats read, the header, Settings and Teams. */
export const competitionKeys = {
  /** The Competition stats read, keyed per user (roles differ) and per season. */
  detail: (compId: string, userId?: string, season?: SeasonParam) => [
    "competition",
    { compId, userId, season },
  ],
  /** Every stats read of one Competition, whichever user and season. */
  detailPrefix: (compId: string) => ["competition", { compId }],
  /** The header read of every season-aware page, keyed per user. */
  info: (compId: string | undefined, userId?: string) => [
    "competitionInfo",
    compId,
    userId,
  ],
  /** Every header read of one Competition, whichever user. */
  infoPrefix: (compId: string) => ["competitionInfo", compId],
  /** The Settings tab's read, keyed per user. */
  settings: (compId: string, userId: string) => [
    "competitionSettings",
    compId,
    userId,
  ],
  /** Every Settings read of one Competition, whichever user. */
  settingsPrefix: (compId: string) => ["competitionSettings", compId],
  /** The team names Teams setup edits. Neither per user nor per season. */
  teams: (compId: string) => ["competitionTeams", compId],
};

/** The League page's tabs. Fixtures and the match details share a prefix. */
export const leagueKeys = {
  /** The selected season's Standings. */
  standings: (competitionId: string, season?: SeasonParam) => [
    "leagueStandings",
    competitionId,
    season,
  ],
  /** Every season's Standings of one Competition. */
  standingsPrefix: (competitionId: string) => [
    "leagueStandings",
    competitionId,
  ],
  /** The selected season's Fixtures. */
  fixtures: (competitionId: string, season?: SeasonParam) => [
    "leagueFixtures",
    competitionId,
    season,
  ],
  /** Every season's Fixtures of one Competition. */
  fixturesPrefix: (competitionId: string) => ["leagueFixtures", competitionId],
  /**
   * One Fixture in full. It shares the Fixtures prefix but is keyed on the
   * match, so a competition-wide invalidation does not reach it.
   */
  matchDetails: (matchId: string) => ["leagueFixtures", matchId],
  /** The selected season's player totals. */
  stats: (competitionId: string, season?: SeasonParam) => [
    "leagueStats",
    { competitionId, season },
  ],
  /** Every season's player totals of one Competition. */
  statsPrefix: (competitionId: string) => ["leagueStats", { competitionId }],
};

export const matchKeys = {
  /**
   * Every match list there is, and deliberately so. A list is keyed on its
   * scope, but the user-wide list carries no `competitionId` and still
   * contains this Competition's matches, so a key scoped to the Competition
   * would miss it. The bare prefix refreshes other Competitions' lists too,
   * which is harmless.
   */
  all: () => ["matches"],
  /**
   * One page of one list. The scope object stays at position 1: the read's
   * `queryFn` and `placeholderData` both read it back off the key.
   */
  list: (scope: MatchListScope): [string, MatchListScope] => ["matches", scope],
  /** The add/edit form's read of one match, cached for minutes. */
  formData: (matchId: string | undefined) => ["match-form-data", matchId],
};

/**
 * Every read that describes a Competition as a whole, refreshed by key prefix:
 * the Competition itself, its header and Settings, its Standings, Fixtures and
 * player totals, and the match lists, for every user and every season the
 * cache holds.
 *
 * Called wherever a write changes the Competition rather than one row of it:
 * rollover (Start new season), Reset competition, Teams setup and Mark as
 * completed. Teams setup adds the team names, the one read of the family that
 * only it changes.
 */
export function invalidateCompetitionReads(
  queryClient: QueryClient,
  competitionId: string,
) {
  const keys: QueryKey[] = [
    competitionKeys.infoPrefix(competitionId),
    competitionKeys.settingsPrefix(competitionId),
    competitionKeys.detailPrefix(competitionId),
    leagueKeys.standingsPrefix(competitionId),
    leagueKeys.fixturesPrefix(competitionId),
    leagueKeys.statsPrefix(competitionId),
    matchKeys.all(),
  ];
  return Promise.all(
    keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}
