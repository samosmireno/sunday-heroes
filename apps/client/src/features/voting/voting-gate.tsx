import { Lock } from "lucide-react";
import { VoterEligibility } from "@repo/shared-types";
import { Button } from "@/components/ui/button";
import { InfoBox } from "@/components/ui/info-box";
import { seasonName } from "@/features/competition/season-labels";

/**
 * `threshold` is typed nullable because a Competition may have no gate, but it
 * is never null here: this banner renders only for a blocked voter, and the
 * gate cannot be shut without a threshold to shut it.
 */
const matches = (count: number | null) =>
  count === 1 ? "1 match" : `${count} matches`;

/**
 * What the armed Voting gate says to a participant it has shut out, over the
 * ballot rather than in place of it. Only ever rendered when `canVote` is
 * false, which the gate answers only once it is armed and the viewer has not
 * qualified — so the counter never appears during the runway, where it would
 * be a number about a rule that is not yet in force.
 *
 * The number is deliberately not written as a countdown. Voting opens when a
 * match is created or edited, never when it is completed: a League Fixture is
 * invited to vote on while it is still not completed, so the admin pressing
 * Complete can tick this counter up while the page is open. Promising "two
 * more and you can vote on this one" would be a lie in both directions — the
 * count can move under the reader, and this ballot may close before they get
 * there.
 */
export function VotingThresholdBanner({
  eligibility,
  seasonNumber,
}: {
  eligibility: VoterEligibility;
  seasonNumber: number | null;
}) {
  const { threshold, matchesThisSeason, remaining } = eligibility;
  const where =
    seasonNumber === null ? "this season" : `in ${seasonName(seasonNumber)}`;

  return (
    <InfoBox
      title="Not eligible to vote yet"
      icon={Lock}
      variant="warning"
      className="mb-6"
    >
      <p>
        You played this match, so its ballot is below. Voting in this
        competition needs {matches(threshold)} played within a single season.
      </p>
      <p className="mt-2">
        You have played {matchesThisSeason} of them {where} — {remaining} to go.
        The count starts again each season: matches you played in an earlier
        season do not carry over.
      </p>
      <p className="mt-2">
        It counts completed matches only, and the admin marks those whenever
        they get round to it, so this is where you stand right now — not a
        countdown to this ballot.
      </p>
    </InfoBox>
  );
}

/**
 * In place of the submit button: the ballot is readable, it just cannot be
 * cast. Back to Dashboard comes with it, because this is the only state of the
 * page that has something to say and no way to act on it.
 */
export function VotingLockNotice({
  onNavigateToDashboard,
}: {
  onNavigateToDashboard: () => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      <p className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-700 bg-bg/30 p-3 text-sm font-medium text-gray-400">
        <Lock size={16} aria-hidden="true" />
        You can't submit votes yet
      </p>
      <Button
        onClick={onNavigateToDashboard}
        className="w-full transform rounded-lg border-2 border-accent/50 bg-accent/20 px-3 py-2 text-accent shadow-md hover:bg-accent/30"
      >
        Back to Dashboard
      </Button>
    </div>
  );
}
