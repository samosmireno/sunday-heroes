import {
  MatchWithDetails,
  MatchWithTeams,
} from "../../repositories/match/types";
import { MatchCreationService } from "./match-creation-service";
import { MatchVotingService } from "./match-voting-service";
import {
  transformMatchServiceToResponse,
  transformMatchesToMatchesResponse,
} from "../../utils/match-transforms";
import { createMatchRequest } from "../../schemas/create-match-request-schema";
import { DashboardService } from "../dashboard-service";
import { CompetitionType } from "@prisma/client";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from "../../utils/errors";
import { CompetitionAuthRepo } from "../../repositories/competition/competition-auth-repo";
import { MatchRepo } from "../../repositories/match/match-repo";
import { SeasonService } from "../season-service";
import { SeasonQuery } from "../../schemas/season-schemas";

export class MatchService {
  static async getMatchById(id: string) {
    const match = await MatchRepo.findByIdWithDetails(id);
    return match ? transformMatchServiceToResponse(match) : null;
  }

  /**
   * The paginated All Matches read. Within a Competition the list and its
   * count follow the season selection (the Current season by default); the
   * user-wide read spans competitions and takes no season.
   */
  static async getMatchesForUser(
    userId: string,
    options: {
      competitionId?: string;
      season?: SeasonQuery;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const dashboardId = await DashboardService.getDashboardIdFromUserId(userId);
    if (!dashboardId) {
      throw new NotFoundError("Dashboard");
    }

    const { competitionId, season, limit = 10, offset = 0 } = options;

    let totalCount: number;
    let matches: MatchWithDetails[];

    if (competitionId) {
      const seasonWhere = await SeasonService.resolveSeasonFilter(
        competitionId,
        season,
      );
      matches = await MatchRepo.findByCompetitionId(competitionId, {
        limit,
        offset,
        where: seasonWhere,
      });
      totalCount = await MatchRepo.countByCompetitionId(
        competitionId,
        seasonWhere,
      );
    } else {
      const matchIds = await MatchRepo.findByUserWithDeduplication(
        userId,
        dashboardId,
        {
          limit,
          offset,
        },
      );

      matches = await MatchRepo.findByIdsWithDetails(matchIds);

      totalCount = await MatchRepo.countByUserWithDeduplication(
        userId,
        dashboardId,
      );
    }

    return {
      matches: transformMatchesToMatchesResponse(userId, matches),
      totalCount: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  static async createMatch(data: createMatchRequest) {
    return MatchCreationService.createMatch(data);
  }

  /**
   * A Match write an admin or moderator makes: read the Match with its Season,
   * check the permission, then refuse a Past season's Match (ADR 0002).
   */
  private static async findForWrite(
    matchId: string,
    userId: string,
    action: "update" | "delete",
  ): Promise<MatchWithTeams> {
    const match = await MatchRepo.findByIdWithTeams(matchId);
    if (!match) {
      throw new NotFoundError("Match");
    }

    const isAuthorized = await CompetitionAuthRepo.isUserAdminOrModerator(
      match.competitionId,
      userId,
    );
    if (!isAuthorized) {
      throw new AuthorizationError(
        `User is not authorized to ${action} this match`,
      );
    }

    SeasonService.assertSeasonOpen(match);

    return match;
  }

  static async updateMatch(
    matchId: string,
    data: createMatchRequest,
    userId: string,
  ) {
    const match = await this.findForWrite(matchId, userId, "update");
    return MatchCreationService.updateMatch(match, data);
  }

  static async deleteMatch(matchId: string, userId: string) {
    const match = await this.findForWrite(matchId, userId, "delete");

    if (match.competition.type !== CompetitionType.DUEL) {
      throw new ConflictError(
        "Cannot delete match in a league/knockout competition",
      );
    }

    return MatchRepo.delete(matchId);
  }

  static async closeExpiredVoting() {
    return MatchVotingService.closeExpiredVoting();
  }
}
