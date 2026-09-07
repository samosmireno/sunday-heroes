import { CompetitionType } from "@repo/shared-types";

/**
 * Everything the Voting threshold readout says, derived from what the admin has
 * already typed into the create-competition form. The admin computes nothing
 * themselves: the runway, the League ceiling and the comparison between them
 * are all worked out here, so the component below only renders sentences.
 *
 * Pure and React-free on purpose — the arithmetic is the part worth pinning
 * down in tests, and none of it needs a form to be exercised.
 */

/** A League's per-player ceiling, and how the chosen threshold sits against it. */
export interface LeagueCeiling {
  teams: number;
  doubleRoundRobin: boolean;
  /** The most matches one player can play in a single Season. */
  matches: number;
  /** The threshold is above `matches`, so a one-team player never reaches it. */
  exceeded: boolean;
}

export type VotingThresholdAdvisory =
  | { kind: "no-threshold" }
  | {
      kind: "threshold";
      threshold: number;
      /** The last match of the runway: `2X`, where everyone still votes. */
      runwayEnd: number;
      /** The first match the gate can apply to: `2X + 1`. */
      firstGatedMatch: number;
      /**
       * The per-Season count used to illustrate that matches never pool across
       * Seasons ("4 last season and 4 this season is still not enough"), or
       * `null` at a threshold of 1, where the example would read as zero.
       */
      pooledExample: number | null;
      ceiling: LeagueCeiling | null;
    };

/**
 * The end of the runway. The Voting gate can only arm from `2X + 1` onwards,
 * because arming needs `completedMatchCount >= 2X` (CONTEXT.md, Voting gate).
 */
export function runwayEnd(threshold: number): number {
  return threshold * 2;
}

/**
 * The most matches a player rostered to one team can play in one Season of a
 * League of `numberOfTeams` teams: every other team once, or twice for a double
 * round robin. Exact at form time, because `LeagueService.generateRoundRobinMatches`
 * generates the whole Season's fixtures the moment the League is created.
 *
 * `null` below two teams, where there is no fixture and so nothing to state.
 */
export function leagueSeasonCeiling(
  numberOfTeams: number,
  doubleRoundRobin: boolean,
): number | null {
  if (!Number.isFinite(numberOfTeams) || numberOfTeams < 2) return null;

  const perOpponent = doubleRoundRobin ? 2 : 1;
  return (numberOfTeams - 1) * perOpponent;
}

/**
 * Whether the threshold sits above a ceiling. Advisory only, never error-grade:
 * see the comment on the readout for why.
 */
export function exceedsCeiling(
  threshold: number,
  ceiling: number | null,
): boolean {
  return ceiling !== null && threshold > ceiling;
}

/**
 * A whole match count, or `null`. The form's number inputs hand react-hook-form
 * the raw string the DOM holds — `""` while untouched — so every watched value
 * arrives here as something that still has to be read.
 */
function matchCount(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;

  return parsed;
}

export function votingThresholdAdvisory({
  threshold,
  competitionType,
  numberOfTeams,
  doubleRoundRobin,
}: {
  threshold: unknown;
  competitionType: CompetitionType | undefined;
  numberOfTeams: unknown;
  doubleRoundRobin: boolean | undefined;
}): VotingThresholdAdvisory {
  const chosen = matchCount(threshold);
  if (chosen === null) return { kind: "no-threshold" };

  return {
    kind: "threshold",
    threshold: chosen,
    runwayEnd: runwayEnd(chosen),
    firstGatedMatch: runwayEnd(chosen) + 1,
    pooledExample: chosen > 1 ? chosen - 1 : null,
    ceiling: leagueCeiling({
      chosen,
      competitionType,
      numberOfTeams,
      doubleRoundRobin,
    }),
  };
}

/**
 * A ceiling for a League only. A Duel has no fixture list and no team count, and
 * a Knockout's bracket is not a round robin, so the reachability question does
 * not arise for either.
 */
function leagueCeiling({
  chosen,
  competitionType,
  numberOfTeams,
  doubleRoundRobin,
}: {
  chosen: number;
  competitionType: CompetitionType | undefined;
  numberOfTeams: unknown;
  doubleRoundRobin: boolean | undefined;
}): LeagueCeiling | null {
  if (competitionType !== CompetitionType.LEAGUE) return null;

  const teams = matchCount(numberOfTeams);
  if (teams === null) return null;

  const isDouble = doubleRoundRobin === true;
  const matches = leagueSeasonCeiling(teams, isDouble);
  if (matches === null) return null;

  return {
    teams,
    doubleRoundRobin: isDouble,
    matches,
    exceeded: exceedsCeiling(chosen, matches),
  };
}
