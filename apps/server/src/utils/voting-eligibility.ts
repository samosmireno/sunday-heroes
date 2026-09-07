/**
 * The Voting gate's whole rule, in one pure place: given a Competition's
 * Voting threshold, its lifetime Completed match count, its Current season and
 * how many Completed matches each player played in each Season, decide who may
 * vote. No Prisma and no repository is reachable from here, so the rule is
 * testable without a database and cannot drift into a query.
 *
 * The unit of computation is the Competition, not the match and not the
 * player: a match contributes only which Competition it belongs to. Callers
 * load one of these per Competition and hand it down.
 */
import { VoterEligibility } from "@repo/shared-types";

/** One player's Completed matches in one Season of the Competition. */
export interface SeasonParticipation {
  dashboardPlayerId: string;
  seasonId: string;
  count: number;
}

export interface VotingEligibilityInput {
  /** The Competition's Voting threshold; null = no gate. */
  threshold: number | null;
  /** Completed matches across every Season, lifetime. */
  completedMatchCount: number;
  /** The Current season, or null for a Competition with none. */
  currentSeason: { id: string; number: number } | null;
  participations: SeasonParticipation[];
}

/**
 * One loaded answer for one Competition.
 *
 * `for()` is **total**: hand it any id and it returns a valid record — a player
 * who never played this Competition, a Competition with no threshold, a
 * Competition still on the runway. That is the point of the value object. With
 * a bare `Map` every call site writes `get(id) ?? someDefault`, and the one
 * that gets the default backwards silently costs a player their vote.
 */
export class VotingEligibility {
  /** The Voting gate is armed: only an Eligible voter's ballot is accepted. */
  readonly armed: boolean;
  /** The Current season's number, for the one surface that names it. */
  readonly currentSeasonNumber: number | null;

  private readonly threshold: number | null;
  /** Every player with `count >= threshold` in some Season. Permanent once earned. */
  private readonly qualifiedPlayerIds: ReadonlySet<string>;
  /**
   * Only the Current season's counts get out. The per-`(player, Season)`
   * breakdown stays inside: the rule needs it to answer `qualified` over any
   * Season, but a "best past season" count would need its own name in
   * `CONTEXT.md` and buys one sentence of copy.
   */
  private readonly currentSeasonCounts: ReadonlyMap<string, number>;

  constructor(args: {
    threshold: number | null;
    armed: boolean;
    currentSeasonNumber: number | null;
    qualifiedPlayerIds: ReadonlySet<string>;
    currentSeasonCounts: ReadonlyMap<string, number>;
  }) {
    this.threshold = args.threshold;
    this.armed = args.armed;
    this.currentSeasonNumber = args.currentSeasonNumber;
    this.qualifiedPlayerIds = args.qualifiedPlayerIds;
    this.currentSeasonCounts = args.currentSeasonCounts;
  }

  /** Total: any id, always a valid record. */
  for(dashboardPlayerId: string): VoterEligibility {
    const qualified = this.qualifiedPlayerIds.has(dashboardPlayerId);
    const matchesThisSeason =
      this.currentSeasonCounts.get(dashboardPlayerId) ?? 0;

    return {
      canVote: !this.armed || qualified,
      qualified,
      armed: this.armed,
      threshold: this.threshold,
      matchesThisSeason,
      remaining:
        this.threshold === null
          ? 0
          : Math.max(0, this.threshold - matchesThisSeason),
    };
  }
}

/**
 * - `qualified` — some Season has `count >= threshold`; never pooled across
 *   Seasons, so four and four is not eight. False when there is no threshold.
 * - `armed` — there is a threshold, the Competition has at least twice it in
 *   lifetime Completed matches, **and** at least one player is qualified. Both,
 *   not either: the runway ends only once somebody could actually pass the bar.
 * - `canVote` — `!armed || qualified`.
 */
export function buildVotingEligibility(
  input: VotingEligibilityInput,
): VotingEligibility {
  const { threshold, completedMatchCount, currentSeason, participations } =
    input;

  const qualifiedPlayerIds = new Set<string>();
  const currentSeasonCounts = new Map<string, number>();

  for (const participation of participations) {
    if (threshold !== null && participation.count >= threshold) {
      qualifiedPlayerIds.add(participation.dashboardPlayerId);
    }
    if (currentSeason !== null && participation.seasonId === currentSeason.id) {
      currentSeasonCounts.set(
        participation.dashboardPlayerId,
        participation.count,
      );
    }
  }

  const armed =
    threshold !== null &&
    completedMatchCount >= 2 * threshold &&
    qualifiedPlayerIds.size > 0;

  return new VotingEligibility({
    threshold,
    armed,
    currentSeasonNumber: currentSeason?.number ?? null,
    qualifiedPlayerIds,
    currentSeasonCounts,
  });
}
