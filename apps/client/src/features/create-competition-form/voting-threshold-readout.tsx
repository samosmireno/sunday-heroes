import { CompetitionType } from "@repo/shared-types";
import {
  LeagueCeiling,
  VotingThresholdAdvisory,
  votingThresholdAdvisory,
} from "./voting-threshold-advisory";

interface VotingThresholdReadoutProps {
  /** The watched field value: a raw string while the admin is typing. */
  threshold: unknown;
  competitionType: CompetitionType | undefined;
  numberOfTeams: unknown;
  doubleRoundRobin: boolean | undefined;
}

/**
 * What the Voting threshold the admin has typed will actually do, restated with
 * their own number. It is always on screen while voting is enabled, because the
 * rule cannot be changed after the Competition is created.
 *
 * Nothing here is error-grade, and there is no confirm step — no checkbox, no
 * dialog — not even when the threshold is above what a League's fixture list can
 * ever give one player. Two facts rule the hard error out: the app does not
 * actually hold the ceiling (`MatchPlayerService.createMatchPlayers` never
 * consults `TeamRoster`, and the player picker searches the whole dashboard),
 * and `numberOfTeams` is mutable after creation — the add/remove team endpoints
 * exist, and each new Season's fixtures are regenerated from the team set as it
 * stands. A hard error would block a value the app can make reachable two clicks
 * later while happily permitting values it will leave unreachable. A confirm
 * step is the same error said more quietly.
 */
export function VotingThresholdReadout(props: VotingThresholdReadoutProps) {
  const advisory = votingThresholdAdvisory(props);

  return (
    <div className="mt-3 space-y-3 rounded-md border border-accent/20 bg-bg/30 p-3">
      {advisory.kind === "no-threshold" ? (
        <p className="text-xs leading-relaxed text-gray-300">
          No threshold. Everyone who played a match can vote on it, from the
          first match onwards.
        </p>
      ) : (
        <ThresholdReadout advisory={advisory} />
      )}
    </div>
  );
}

function ThresholdReadout({
  advisory,
}: {
  advisory: Extract<VotingThresholdAdvisory, { kind: "threshold" }>;
}) {
  const { threshold, runwayEnd, firstGatedMatch, pooledExample, ceiling } =
    advisory;

  return (
    <>
      <div className="space-y-1">
        <p className="text-xs leading-relaxed text-gray-300">
          A player who plays {threshold} {matches(threshold)} in one season can
          vote — in that season, and in every season after it.
        </p>
        {pooledExample !== null && (
          <p className="text-xs leading-relaxed text-gray-400">
            Matches do not add up across seasons: {pooledExample} last season
            and {pooledExample} this season is still not enough.
          </p>
        )}
      </div>

      {/* The runway, as a bar. Both numbers are derived from the threshold. */}
      <div>
        <div className="flex h-2 w-full overflow-hidden rounded-full border border-accent/30">
          <div className="w-3/5 bg-accent/60" />
          <div className="w-2/5 bg-accent/15" />
        </div>
        <div className="mt-1 flex justify-between gap-3 text-[11px] leading-tight">
          <span className="text-gray-300">
            Matches 1–{runwayEnd} · everyone votes
          </span>
          <span className="text-right text-gray-400">
            Match {firstGatedMatch} onwards · threshold applies
          </span>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-gray-400">
        The threshold starts applying only once both of these are true: the
        competition has {runwayEnd} completed matches in total, across every
        season, and at least one player has reached {threshold} in a single
        season. If match {firstGatedMatch} arrives with nobody there yet,
        everyone keeps voting — that is deliberate, not a bug.
      </p>

      {ceiling && <CeilingLine ceiling={ceiling} threshold={threshold} />}
    </>
  );
}

/**
 * The League ceiling: a player rostered to one team can only play that team's
 * fixtures. The whole Season's fixtures are generated when the League is
 * created, so the number is exact at form time. Stated as fact, amber when the
 * threshold is above it, and never a reason to refuse the form.
 */
function CeilingLine({
  ceiling,
  threshold,
}: {
  ceiling: LeagueCeiling;
  threshold: number;
}) {
  const fact = ceiling.doubleRoundRobin
    ? `With ${ceiling.teams} teams playing each other twice, a player can play at most ${ceiling.matches} ${matches(ceiling.matches)} in a season.`
    : `With ${ceiling.teams} teams, a player can play at most ${ceiling.matches} ${matches(ceiling.matches)} in a season.`;

  if (!ceiling.exceeded) {
    return <p className="text-xs leading-relaxed text-gray-400">{fact}</p>;
  }

  return (
    <div className="space-y-1 rounded-md border border-amber-500/40 bg-amber-900/20 p-2">
      <p className="text-xs leading-relaxed text-amber-400">{fact}</p>
      <p className="text-xs leading-relaxed text-amber-400">
        A threshold of {threshold} is above that, so a player who stays on one
        team never reaches it. You can still create the competition — teams can
        be added afterwards.
      </p>
    </div>
  );
}

function matches(count: number) {
  return count === 1 ? "match" : "matches";
}
