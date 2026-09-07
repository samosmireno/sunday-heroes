// components/features/pending-votes/pending-vote-row.tsx
import { CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Role, PendingVote, VoterEligibility } from "@repo/shared-types";
import { thresholdTooltip } from "@/features/voting/threshold-copy";

interface PendingVoteRowProps {
  vote: PendingVote;
  matchId: string;
  teams: string[];
  homeScore: number;
  awayScore: number;
  matchDate?: string;
  userRole: Role;
  onVoteClick: (matchId: string, playerId: string) => void;
}

/** An Eligible voter of an armed Competition: the standing, with no number attached. */
function EligibleBadge() {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-green-900/30 px-2 py-1 text-xs font-medium text-green-400">
      <CheckCircle2 size={14} aria-hidden="true" />
      Eligible
    </span>
  );
}

/**
 * A player the armed Voting gate has shut out, in place of the Vote button. It
 * carries the Current-season meter rather than `remaining`, which is
 * `max(0, threshold - matchesThisSeason)` whether or not the player qualified
 * — a player who qualified in a closed Season and has played nothing this one
 * reports a non-zero `remaining` while `canVote` is true.
 *
 * Rendered only under `armed && !qualified`, so the meter never appears during
 * the runway, where it would be a number about a rule not yet in force.
 */
function IneligibleStanding({
  eligibility,
}: {
  eligibility: VoterEligibility;
}) {
  const { threshold, matchesThisSeason } = eligibility;

  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-gray-500/20 px-2 py-1 text-xs font-medium text-gray-400"
      title={thresholdTooltip(eligibility, "player")}
      role="note"
      aria-label={`Not eligible to vote yet: ${matchesThisSeason} of ${threshold} matches this season`}
    >
      <Lock size={14} aria-hidden="true" />
      <span>{`${matchesThisSeason}/${threshold}`}</span>
      <span>Not eligible yet</span>
    </span>
  );
}

export function PendingVoteRow({
  vote,
  matchId,
  teams,
  homeScore,
  awayScore,
  matchDate,
  userRole,
  onVoteClick,
}: PendingVoteRowProps) {
  // The gate narrows who may be voted for; it never widens the role check.
  // Without it the button submits and the server refuses — an offer the app
  // already knows it cannot keep.
  const canVote =
    !vote.voted &&
    (vote.isUser || userRole !== Role.PLAYER) &&
    vote.eligibility.canVote;

  const { armed, qualified } = vote.eligibility;

  return (
    <tr className="border-b border-accent/10">
      <td className="p-1 text-sm font-medium text-accent sm:p-3 sm:text-base">
        {vote.playerName}
      </td>
      <td className="p-1 text-sm text-gray-300 sm:p-3 sm:text-base">
        <div className="flex flex-col sm:items-center md:flex-row">
          <span className="mb-1 sm:mb-0">
            {teams[0]} vs {teams[1]}
          </span>
          <span className="text-accent sm:ml-2">
            ({homeScore} - {awayScore})
          </span>
        </div>
      </td>
      <td className="hidden p-1 text-sm text-gray-300 sm:block sm:p-3 sm:text-base">
        {matchDate ? new Date(matchDate).toLocaleDateString() : "TBD"}
      </td>
      <td className="p-3 px-5 text-sm sm:text-base">
        <div className="flex items-center gap-2">
          {/* Nothing during the runway: the cell is exactly what it was. */}
          {armed &&
            (qualified ? (
              <EligibleBadge />
            ) : (
              <IneligibleStanding eligibility={vote.eligibility} />
            ))}
          {canVote && (
            <Button
              onClick={() => onVoteClick(matchId, vote.playerId)}
              className="bg-accent/20 p-1 text-accent hover:bg-accent/30 sm:p-3"
            >
              Vote
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
