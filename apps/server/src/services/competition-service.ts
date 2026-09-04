import { CompetitionType, Prisma, VotingStatus } from "@prisma/client";
import prisma from "../repositories/prisma-client";
import { CompetitionRepo } from "../repositories/competition/competition-repo";
import { MatchRepo } from "../repositories/match/match-repo";
import { SeasonRepo } from "../repositories/season/season-repo";
import { isCurrentSeason } from "../repositories/season/types";
import { TeamCompetitionRepo } from "../repositories/team-competition-repo";
import { CompetitionQueryRepo } from "../repositories/competition/competition-query-repo";
import { CompetitionAuthRepo } from "../repositories/competition/competition-auth-repo";
import {
  transformCompetitionToResponse,
  transformAddCompetitionRequestToService,
  transformCompetitionToInfoResponse,
  transformCompetitionToSettingsResponse,
  transformCompetitionToTeamsResponse,
} from "../utils/competition-transforms";
import {
  transformCurrentSeasonToResponse,
  transformSeasonToResponse,
} from "../utils/season-transforms";
import { transformDashboardCompetitionsToDetailedResponse } from "../utils/dashboard-transforms";
import { DashboardService } from "./dashboard-service";
import { CreateCompetitionInput } from "../schemas/create-competition-request-schema";
import { TeamService } from "./team-service";
import { AuthorizationError, NotFoundError } from "../utils/errors";
import { DashboardPlayerService } from "./dashboard-player-service";
import { SeasonService } from "./season-service";
import { SeasonQuery } from "../schemas/season-schemas";

export class CompetitionService {
  static async getAllCompetitions() {
    const competitions = await CompetitionRepo.findAll();
    return competitions;
  }

  static async getCompetitionById(id: string) {
    const competition = await CompetitionRepo.findByIdWithDetails(id);
    return competition;
  }

  /** Matches and player stats follow the selected season, Current by default. */
  static async getCompetitionStats(
    competitionId: string,
    userId?: string,
    season?: SeasonQuery,
  ) {
    const seasonWhere = await SeasonService.resolveSeasonFilter(
      competitionId,
      season,
    );
    const competition = await CompetitionRepo.findByIdWithDetails(
      competitionId,
      seasonWhere,
    );
    if (!competition) {
      throw new NotFoundError("Competition");
    }
    return transformCompetitionToResponse(competition, userId);
  }

  static async getCompetitionInfo(competitionId: string, userId?: string) {
    const [competition, seasons] = await Promise.all([
      CompetitionRepo.findByIdWithInfo(competitionId),
      SeasonRepo.listWithCounts(competitionId),
    ]);
    if (!competition) {
      throw new NotFoundError("Competition");
    }
    return transformCompetitionToInfoResponse(
      competition,
      seasons.map(transformSeasonToResponse),
      userId,
    );
  }

  static async getCompetitionSettings(competitionId: string, userId: string) {
    const [competition, seasons] = await Promise.all([
      CompetitionRepo.findByIdWithSettings(competitionId),
      SeasonRepo.listWithCounts(competitionId),
    ]);
    if (!competition) {
      throw new NotFoundError("Competition");
    }

    const currentSeason = seasons.find(isCurrentSeason);
    if (!currentSeason) {
      throw new NotFoundError("Season");
    }

    const openVotingCount = await MatchRepo.countBySeasonId(currentSeason.id, {
      votingStatus: VotingStatus.OPEN,
    });

    return transformCompetitionToSettingsResponse(
      competition,
      userId,
      transformCurrentSeasonToResponse(currentSeason, {
        notCompletedCount:
          currentSeason.matchCount - currentSeason.completedMatchCount,
        openVotingCount,
      }),
      seasons.map(transformSeasonToResponse),
    );
  }

  static async getCompetitionTeams(competitionId: string) {
    const competition = await CompetitionRepo.findByIdWithTeams(competitionId);
    if (!competition) {
      throw new NotFoundError("Competition");
    }
    return transformCompetitionToTeamsResponse(competition);
  }

  static async getDetailedCompetitions(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      type?: CompetitionType;
      search?: string;
    } = {},
  ) {
    const dashboardId = await DashboardService.getDashboardIdFromUserId(userId);
    if (!dashboardId) {
      throw new NotFoundError("Dashboard");
    }

    const { page = 0, limit = 10, type, search } = options;
    const offset = page * limit;

    const { competitions, totalCount } =
      await CompetitionQueryRepo.findByUserWithFilters(userId, dashboardId, {
        type,
        search,
        limit,
        offset,
      });

    const competitionIds = competitions.map((c) => c.id);

    const { matchCounts, teamCounts, playerCounts } =
      await CompetitionQueryRepo.getAggregates(competitionIds);

    const userRoles = await CompetitionRepo.getUserRolesForCompetitions(
      userId,
      competitionIds,
    );

    const response = transformDashboardCompetitionsToDetailedResponse(
      matchCounts,
      teamCounts,
      playerCounts,
      userRoles,
      competitions,
    );

    return {
      competitions: response,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  /**
   * Creates the Competition and its Season 1 together: every Competition is in
   * Season 1 from creation, started at the Competition's `createdAt` (ADR 0001).
   * Callers that need more in the same transaction (League creation) pass `tx`.
   */
  static async createCompetition(
    data: CreateCompetitionInput,
    tx?: Prisma.TransactionClient,
  ) {
    const dashboardId = await DashboardService.getDashboardIdFromUserId(
      data.userId,
    );
    if (!dashboardId) {
      throw new NotFoundError("Dashboard");
    }

    const competitionToAdd = transformAddCompetitionRequestToService(
      data,
      dashboardId,
    );

    const createWithSeason = async (client: Prisma.TransactionClient) => {
      const competition = await CompetitionRepo.create(
        competitionToAdd,
        client,
      );
      await SeasonRepo.create(
        {
          competitionId: competition.id,
          number: 1,
          startedAt: competition.createdAt,
        },
        client,
      );
      return competition;
    };

    return tx ? createWithSeason(tx) : prisma.$transaction(createWithSeason);
  }

  /**
   * Reset competition: deletes every Match across all Seasons, deletes the
   * Seasons and opens a fresh Season 1 at the reset instant, in one
   * transaction. A League keeps its teams with the Standings counters zeroed
   * in place, exactly as at rollover, so Teams setup regenerates Season 1's
   * Fixtures (ADR 0001). The dashboard-wide unused-player cleanup runs after.
   */
  static async resetCompetition(competitionId: string, userId: string) {
    const isAuthorized = await this.canUserModifyCompetition(
      competitionId,
      userId,
    );
    if (!isAuthorized) {
      throw new AuthorizationError(
        "User is not authorized to reset this competition",
      );
    }

    const competition = await CompetitionRepo.findById(competitionId);
    if (!competition) {
      throw new NotFoundError("Competition");
    }

    const isLeague = competition.type === CompetitionType.LEAGUE;

    await prisma.$transaction(async (tx) => {
      // A League from before its match type was stored has it only on its
      // Matches; keep it so Teams setup can regenerate Season 1's Fixtures.
      if (isLeague && !competition.matchType) {
        const matchType = await MatchRepo.findLatestMatchType(
          competitionId,
          tx,
        );
        if (matchType) {
          await CompetitionRepo.update(competitionId, { matchType }, tx);
        }
      }

      await MatchRepo.deleteByCompetitionId(competitionId, tx);
      await SeasonRepo.deleteByCompetitionId(competitionId, tx);
      await SeasonRepo.create(
        { competitionId, number: 1, startedAt: new Date() },
        tx,
      );

      if (isLeague) {
        await TeamCompetitionRepo.bulkResetStats(competitionId, tx);
      }
    });

    await DashboardPlayerService.cleanupUnusedPlayers();
  }

  static async deleteCompetition(competitionId: string, userId: string) {
    const isAuthorized = await this.canUserModifyCompetition(
      competitionId,
      userId,
    );
    if (!isAuthorized) {
      throw new AuthorizationError(
        "User is not authorized to delete this competition",
      );
    }
    await TeamService.deleteTeamsOnlyInCompetition(competitionId);

    await CompetitionRepo.delete(competitionId);

    await DashboardPlayerService.cleanupUnusedPlayers();
  }

  static async isUserAdmin(
    competitionId: string,
    userId: string,
  ): Promise<boolean> {
    const adminId = await CompetitionAuthRepo.getDashboardAdmin(competitionId);
    return adminId === userId;
  }

  static async isUserModerator(
    competitionId: string,
    userId: string,
  ): Promise<boolean> {
    const moderatorIds = await CompetitionAuthRepo.getModerators(competitionId);

    return moderatorIds.includes(userId);
  }

  static async isUserAdminOrModerator(
    competitionId: string,
    userId: string,
  ): Promise<boolean> {
    const [adminId, moderatorIds] = await Promise.all([
      CompetitionAuthRepo.getDashboardAdmin(competitionId),
      CompetitionAuthRepo.getModerators(competitionId),
    ]);

    return adminId === userId || moderatorIds.includes(userId);
  }

  static async canUserModifyCompetition(
    competitionId: string,
    userId: string,
  ): Promise<boolean> {
    return this.isUserAdmin(competitionId, userId);
  }
}
