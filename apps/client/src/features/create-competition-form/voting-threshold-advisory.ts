import { CompetitionType } from "@repo/shared-types";
import {
  LEAGUE_TEAMS_MAX,
  LEAGUE_TEAMS_MIN,
  VOTING_THRESHOLD_MAX,
  VOTING_THRESHOLD_MIN,
} from "./create-competition-schema";

/**
 * Everything the Voting threshold readout says, derived from what the admin has
 * already typed into the create-competition form. The admin computes nothing
 * themselves: the runway, the League ceiling and the comparison between them
 * are all worked out here, so the component below only renders sentences.
 *
 * Pure and React-free on purpose — the arithmetic is the part worth pinning
 * down in tests, and none of it needs a form to be exercised.
 */

/**
 * The form values the readout is derived from, exactly as react-hook-form hands
 * them over: a number input's value is the raw string the DOM holds, and `""`
 * is the untouched state, so the two counts arrive as something still to be
 * read rather than as numbers.
 */
export interface VotingThresholdFormValues {
  threshold: unknown;
  competitionType: CompetitionType | undefined;
  numberOfTeams: unknown;
  doubleRoundRobin: boolean | undefined;
}

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
  /** A value typed but outside what the form will accept: say nothing. */
  | { kind: "out-of-range" }
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
 * A whole number within `min`-`max`, or `null` for anything else — empty,
 * fractional, or out of range. Out of range matters as much as empty: the
 * schema refuses a threshold outside 1-50 and a team count outside 3-16, and a
 * readout describing a rule the form will not create is worse than no readout,
 * so those values fall back to `null` and the field's own error message is
 * left to say what is wrong.
 */
/** Nothing typed yet. A number input holds `""` until the admin touches it. */
function isBlank(value: unknown): boolean {
  return value === "" || value === null || value === undefined;
}

function wholeNumberWithin(
  value: unknown,
  min: number,
  max: number,
): number | null {
  if (isBlank(value)) return null;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null;

  return parsed;
}

export function votingThresholdAdvisory({
  threshold,
  competitionType,
  numberOfTeams,
  doubleRoundRobin,
}: VotingThresholdFormValues): VotingThresholdAdvisory {
  if (isBlank(threshold)) return { kind: "no-threshold" };

  const chosen = wholeNumberWithin(
    threshold,
    VOTING_THRESHOLD_MIN,
    VOTING_THRESHOLD_MAX,
  );
  // Typed, but not a threshold the form will create — 0, 51, 2.5. The field's
  // own error message already says so, and "no threshold, everyone can vote"
  // would contradict it under a field that is refusing the value.
  if (chosen === null) return { kind: "out-of-range" };

  return {
    kind: "threshold",
    threshold: chosen,
    runwayEnd: runwayEnd(chosen),
    firstGatedMatch: runwayEnd(chosen) + 1,
    pooledExample: chosen > 1 ? chosen - 1 : null,
    ceiling: leagueCeiling(chosen, competitionType, {
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
function leagueCeiling(
  chosen: number,
  competitionType: CompetitionType | undefined,
  {
    numberOfTeams,
    doubleRoundRobin,
  }: Pick<VotingThresholdFormValues, "numberOfTeams" | "doubleRoundRobin">,
): LeagueCeiling | null {
  if (competitionType !== CompetitionType.LEAGUE) return null;

  const teams = wholeNumberWithin(
    numberOfTeams,
    LEAGUE_TEAMS_MIN,
    LEAGUE_TEAMS_MAX,
  );
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
