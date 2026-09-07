/**
 * Loads the Voting gate's answer for whole Competitions at a time. The unit of
 * computation is the Competition, not the match and not the player, which is
 * what stops N+1 being something every caller has to remember to avoid: a
 * caller loads one object and hands it down.
 */
import { CompetitionRepo } from "../repositories/competition/competition-repo";
import { SeasonRepo } from "../repositories/season/season-repo";
import { VotingEligibilityRepo } from "../repositories/voting-eligibility/voting-eligibility-repo";
import {
  buildVotingEligibility,
  SeasonParticipation,
  VotingEligibility,
} from "../utils/voting-eligibility";

export class VotingEligibilityService {
  /**
   * The real load: a fixed four queries regardless of how many Competitions
   * come back, because both aggregates and both lookups take the whole list.
   * `sendReminderEmails` walks every expiring match in the system, an
   * unbounded fan-out across Competitions, and must not grow queries with it.
   *
   * **No transaction client, deliberately**, breaking the repo convention.
   * `MatchCreationService.createMatch` creates a Duel match `isCompleted: true`
   * with its `MatchPlayer` rows and opens its voting inside one transaction.
   * That match counts toward qualification, so a player whose qualifying match
   * is this one is eligible — but only visibly so from inside that
   * transaction. Reading through a caller's `tx` would therefore hand back an
   * answer that depends on which transaction happened to be open. Each caller
   * instead loads at a point where what it needs is committed (the email path
   * loads inside its `setImmediate`, `submitVotes` loads before opening its
   * transaction). Do not add a `tx?` parameter here.
   *
   * **No cache either.** Eligibility is live at submit time, and completing a
   * match, adding a player and Reset competition would each need invalidation.
   * The returned object is the memo: hold it and pass it down.
   */
  static async loadMany(
    competitionIds: string[],
  ): Promise<Map<string, VotingEligibility>> {
    const ids = [...new Set(competitionIds)];
    if (ids.length === 0) return new Map();

    const [participations, completedMatchCounts, thresholds, currentSeasons] =
      await Promise.all([
        VotingEligibilityRepo.participationCounts(ids),
        VotingEligibilityRepo.completedMatchCounts(ids),
        CompetitionRepo.findVotingThresholds(ids),
        SeasonRepo.findCurrentMany(ids),
      ]);

    const participationsByCompetition = new Map<
      string,
      SeasonParticipation[]
    >();
    for (const row of participations) {
      const rows = participationsByCompetition.get(row.competitionId);
      if (rows) {
        rows.push(row);
      } else {
        participationsByCompetition.set(row.competitionId, [row]);
      }
    }

    return new Map(
      ids.map((competitionId) => {
        const currentSeason = currentSeasons.get(competitionId);

        return [
          competitionId,
          buildVotingEligibility({
            threshold: thresholds.get(competitionId) ?? null,
            completedMatchCount: completedMatchCounts.get(competitionId) ?? 0,
            currentSeason: currentSeason
              ? { id: currentSeason.id, number: currentSeason.number }
              : null,
            participations:
              participationsByCompetition.get(competitionId) ?? [],
          }),
        ];
      }),
    );
  }

  /** One Competition, over `loadMany`. */
  static async load(competitionId: string): Promise<VotingEligibility> {
    const eligibilities = await this.loadMany([competitionId]);
    // `loadMany` keys an entry for every id it is given, an id belonging to no
    // Competition included: that one loads as a Competition with no gate.
    return eligibilities.get(competitionId)!;
  }
}
