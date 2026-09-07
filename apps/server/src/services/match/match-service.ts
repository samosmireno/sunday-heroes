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
import { VotingEligibilityService } from "../voting-eligibility-service";
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
   *
   * The two branches admit their viewer differently, and neither of them by
   * ownership of a Dashboard. A Competition's list is the whole Competition,
   * open to anyone on the Dashboard it lives on. The user-wide list is every
   * Match the viewer played, wherever it was played, and for an admin the
   * Dashboard they administer on top of that.
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
    const { competitionId, season, limit = 10, offset = 0 } = options;

    let totalCount: number;
    let matches: MatchWithDetails[];

    if (competitionId) {
      // Membership of the Competition's own Dashboard is what admits the
      // viewer. This read used to resolve the viewer's *own* Dashboard and so
      // admitted only its admin, which was never the intent and left the page
      // unreachable for a plain player (#59).
      const dashboardId =
        await DashboardService.getDashboardIdFromCompetitionId(competitionId);
      const canAccess = await DashboardService.canUserAccessDashboard(
        dashboardId,
        userId,
      );
      if (!canAccess) {
        throw new AuthorizationError(
          "User is not a member of this competition's dashboard",
        );
      }

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
      // Null for a viewer who administers no Dashboard, which leaves the read
      // as the matches they played and nothing else.
      const administeredDashboardId =
        await DashboardService.findAdministeredDashboardId(userId);

      const matchIds = await MatchRepo.findByUserWithDeduplication(
        userId,
        administeredDashboardId,
        {
          limit,
          offset,
        },
      );

      matches = await MatchRepo.findByIdsWithDetails(matchIds);

      totalCount = await MatchRepo.countByUserWithDeduplication(
        userId,
        administeredDashboardId,
      );
    }

    // One eligibility load for the page, over its distinct Competitions —
    // never one per match. The transform takes the viewer's dashboard-player
    // identity off each Match's own players, so the page needs no lookup of
    // its own and stays right across dashboards.
    const eligibilities = await VotingEligibilityService.loadMany([
      ...new Set(matches.map((match) => match.competitionId)),
    ]);

    return {
      matches: transformMatchesToMatchesResponse(
        userId,
        matches,
        eligibilities,
      ),
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
