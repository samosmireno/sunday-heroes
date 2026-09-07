import { VoterEligibility } from "@repo/shared-types";

/**
 * The one sentence that explains the Voting gate to someone it has shut out.
 * It says the same thing on the matches list and on the admin's on-behalf-of
 * list, so it is written once: two surfaces phrasing the per-Season rule
 * slightly differently is how a rule starts sounding like two rules.
 *
 * `subject` is who the reader is being told about — themselves on the matches
 * list, somebody else on the admin's list — and is the only thing that differs.
 *
 * "Completed" is deliberate and matches `CONTEXT.md`: the Voting threshold
 * counts Completed matches, and on a League a Fixture is played, then marked
 * Completed by the admin some time later.
 */
export function thresholdTooltip(
  eligibility: VoterEligibility,
  subject: "viewer" | "player",
): string {
  const { threshold, matchesThisSeason } = eligibility;
  const who = subject === "viewer" ? "You have" : "This player has";

  return (
    `Voting in this competition needs ${threshold} completed matches played within a single season. ` +
    `${who} played ${matchesThisSeason} this season, and matches do not add up across seasons.`
  );
}
