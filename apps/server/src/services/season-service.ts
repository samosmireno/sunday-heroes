import { CompetitionType, Prisma, Season } from "@prisma/client";
import prisma from "../repositories/prisma-client";
import { CompetitionRepo } from "../repositories/competition/competition-repo";
import { SeasonRepo } from "../repositories/season/season-repo";
import {
  isCurrentSeason,
  SeasonWithCounts,
} from "../repositories/season/types";
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

/** A season selection resolved once: what its Match reads filter on, and which Season it is. */
export interface SeasonSelection {
  where: SeasonWhere;
  /**
   * The Current season, selected by default or by its own number. It is the
   * one Season whose Standings are the live counters (ADR 0003).
   */
  isCurrent: boolean;
}

/** A Match read with its Season, as the write paths load it. */
export interface MatchInSeason {
  season: Pick<Season, "endedAt">;
}

export class SeasonService {
  /**
   * Past seasons are read-only (ADR 0002): a Match whose Season is closed can
   * be neither edited, completed nor deleted. Called after the permission
   * check on each write path, on a Match read that already carries its Season.
   */
  static assertSeasonOpen(match: MatchInSeason): void {
    if (!isCurrentSeason(match.season)) {
      throw new ConflictError("Matches from a past season cannot be changed.");
    }
  }

  /**
   * The season filter contract: absent selects the Current season, a number one
   * Season of this Competition, "all" every Season. Season numbers are per
   * Competition, so a number that exists only elsewhere is not found.
   */
  static async resolveSeasonFilter(
    competitionId: string,
    season: SeasonQuery,
  ): Promise<SeasonWhere> {
    return (await this.resolveSeasonSelection(competitionId, season)).where;
  }

  /** The season filter contract, with the selection's identity for a read that branches on it. */
  static async resolveSeasonSelection(
    competitionId: string,
    season: SeasonQuery,
  ): Promise<SeasonSelection> {
    if (season === "all") {
      return { where: {}, isCurrent: false };
    }

    const current = await SeasonRepo.findCurrent(competitionId);
    if (!current) {
      // Every Competition has a Current season, so a miss on the Current
      // season means the Competition itself is unknown.
      if (!(await CompetitionRepo.findById(competitionId))) {
        throw new NotFoundError("Competition");
      }
      throw new NotFoundError("Season");
    }
    if (season === undefined) {
      return { where: { seasonId: current.id }, isCurrent: true };
    }

    const selected = await SeasonRepo.findByNumber(competitionId, season);
    if (!selected) {
      throw new NotFoundError("Season");
    }

    return {
      where: { seasonId: selected.id },
      isCurrent: selected.id === current.id,
    };
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
