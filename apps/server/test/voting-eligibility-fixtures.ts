/**
 * A loaded Voting gate, built by hand for the `unit` project.
 *
 * The rule itself is covered exhaustively in `voting-eligibility.test.ts`
 * against `buildVotingEligibility`. Everything downstream — the pending count,
 * the transforms — only ever asks a loaded object `canVote`, so what those
 * tests need is a gate in a known state, not a second copy of the arithmetic.
 * Real `VotingEligibility` objects rather than stubs, so a test can never
 * assert against a gate the rule could not actually produce.
 */
import { buildVotingEligibility } from "../src/utils/voting-eligibility";

/** The one Season these fixtures count in; a Past season needs the real builder. */
const SEASON = "season-1";

/**
 * An **armed** gate that admits exactly `qualified` — a Competition well past
 * twice its threshold, so arming turns only on who has reached it. Pass
 * `threshold: null` for a Competition with no gate, where everyone votes.
 */
export function gate(threshold: number | null, qualified: string[] = []) {
  return buildVotingEligibility({
    threshold,
    completedMatchCount: 100,
    currentSeason: { id: SEASON, number: 1 },
    participations: qualified.map((dashboardPlayerId) => ({
      dashboardPlayerId,
      seasonId: SEASON,
      count: threshold ?? 0,
    })),
  });
}
