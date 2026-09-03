import { CompetitionType, Prisma } from "@prisma/client";
import prisma from "../repositories/prisma-client";
import { CompetitionRepo } from "../repositories/competition/competition-repo";
import { SeasonRepo } from "../repositories/season/season-repo";
import { SeasonWithCounts } from "../repositories/season/types";
import { TeamCompetitionRepo } from "../repositories/team-competition-repo";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from "../utils/errors";
import { CompetitionService } from "./competition-service";
import { SeasonQuery } from "../schemas/season-schemas";

/** The Prisma where fragment a season selection adds to a Match read. */
export type SeasonWhere = Pick<Prisma.MatchWhereInput, "seasonId">;

export class SeasonService {
  /**
   * The season filter contract: absent selects the Current season, a number one
   * Season of this Competition, "all" every Season. Season numbers are per
   * Competition, so a number that exists only elsewhere is not found.
   */
  static async resolveSeasonFilter(
    competitionId: string,
    season: SeasonQuery,
  ): Promise<SeasonWhere> {
    if (season === "all") {
      return {};
    }

    const selected =
      season === undefined
        ? await SeasonRepo.findCurrent(competitionId)
        : await SeasonRepo.findByNumber(competitionId, season);
    if (!selected) {
      // Every Competition has a Current season, so a miss on the Current
      // season means the Competition itself is unknown.
      if (!(await CompetitionRepo.findById(competitionId))) {
        throw new NotFoundError("Competition");
      }
      throw new NotFoundError("Season");
    }

    return { seasonId: selected.id };
  }

  /**
   * Start new season: closes the Current season and opens the next one in one
   * transaction (ADR 0001). A League's Standings counters are zeroed in place;
   * nothing else is written: no Fixtures, no Match, open voting runs on.
   */
  static async startNewSeason(
    competitionId: string,
    userId: string,
  ): Promise<SeasonWithCounts> {
    const isAuthorized = await CompetitionService.canUserModifyCompetition(
      competitionId,
      userId,
    );
    if (!isAuthorized) {
      throw new AuthorizationError(
        "User is not authorized to start a new season in this competition",
      );
    }

    const competition = await CompetitionRepo.findById(competitionId);
    if (!competition) {
      throw new NotFoundError("Competition");
    }

    return prisma.$transaction(async (tx) => {
      const current = await SeasonRepo.findCurrentWithMatchCount(
        competitionId,
        tx,
      );
      if (!current) {
        throw new NotFoundError("Season");
      }
      if (current.matchCount === 0) {
        throw new ConflictError("The current season has no matches.");
      }

      const now = new Date();
      const closed = await SeasonRepo.close(current.id, now, tx);
      if (closed === 0) {
        throw new ConflictError("The season has already been closed.");
      }

      const next = await SeasonRepo.create(
        { competitionId, number: current.number + 1, startedAt: now },
        tx,
      );

      if (competition.type === CompetitionType.LEAGUE) {
        await TeamCompetitionRepo.bulkResetStats(competitionId, tx);
      }

      // The Season just opened holds no Match.
      return { ...next, matchCount: 0, completedMatchCount: 0 };
    });
  }
}
