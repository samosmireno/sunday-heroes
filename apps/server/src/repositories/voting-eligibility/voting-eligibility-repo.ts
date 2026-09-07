/**
 * The two aggregates the Voting gate is decided from. Its own folder: the
 * participation query spans `MatchPlayer` and `Match` and belongs to neither's
 * repo.
 *
 * Both count Completed matches only, matching `CONTEXT.md`'s "only Completed
 * matches count toward Standings and player stats", and both take a list of
 * Competition ids so the shape never changes between one Competition and many:
 * the reminder cron fans out across every Competition with an expiring match,
 * and that must stay one query however many come back.
 *
 * No `tx?` parameter, unlike the rest of the repositories. See
 * `VotingEligibilityService` for why the loader must never read from inside a
 * caller's transaction.
 */
import { Prisma } from "@prisma/client";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";
import prisma from "../prisma-client";
import { ParticipationCount } from "./types";

export class VotingEligibilityRepo {
  /**
   * Completed matches per `(Competition, player, Season)`, the rows
   * qualification is judged from. Raw SQL because Prisma's `groupBy` only
   * groups by scalar fields of the model being grouped and `seasonId` lives on
   * `Match`, not `MatchPlayer`; the alternative — `findMany` then count in JS —
   * would drag every match-player row of every Competition in the list back
   * into the process, which is exactly what the cron's unbounded fan-out must
   * not do.
   */
  static async participationCounts(
    competitionIds: string[],
  ): Promise<ParticipationCount[]> {
    if (competitionIds.length === 0) return [];

    try {
      return await prisma.$queryRaw<ParticipationCount[]>`
        SELECT
          m."competitionId" AS "competitionId",
          mp."dashboardPlayerId" AS "dashboardPlayerId",
          m."seasonId" AS "seasonId",
          COUNT(*)::int AS "count"
        FROM "MatchPlayer" mp
        JOIN "Match" m ON mp."matchId" = m.id
        WHERE m."competitionId" IN (${Prisma.join(competitionIds)})
          AND m."isCompleted" = true
        GROUP BY m."competitionId", mp."dashboardPlayerId", m."seasonId"
      `;
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "VotingEligibilityRepo.participationCounts",
      );
    }
  }

  /**
   * Lifetime Completed matches per Competition, across every Season: the count
   * the runway is measured against. Both fields are scalars on `Match`, so
   * this one needs no raw SQL. A Competition with no Completed match is absent
   * from the map rather than present at zero.
   */
  static async completedMatchCounts(
    competitionIds: string[],
  ): Promise<Map<string, number>> {
    if (competitionIds.length === 0) return new Map();

    try {
      const rows = await prisma.match.groupBy({
        by: ["competitionId"],
        where: { competitionId: { in: competitionIds }, isCompleted: true },
        _count: { _all: true },
      });

      return new Map(rows.map((row) => [row.competitionId, row._count._all]));
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "VotingEligibilityRepo.completedMatchCounts",
      );
    }
  }
}
