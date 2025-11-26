import { CompetitionType } from "@prisma/client";
import { CompetitionRepo } from "../repositories/competition/competition-repo";
import { CompetitionQueryRepo } from "../repositories/competition/competition-query-repo";
import { CompetitionAuthRepo } from "../repositories/competition/competition-auth-repo";
import { CompetitionVotingRepo } from "../repositories/competition/competition-voting-repo";
import {
  transformCompetitionToResponse,
  transformAddCompetitionRequestToService,
} from "../utils/competition-transforms";
import { transformDashboardCompetitionsToDetailedResponse } from "../utils/dashboard-transforms";
import { DashboardService } from "./dashboard-service";
import { createCompetitionRequest } from "../schemas/create-competition-request-schema";
import { TeamService } from "./team-service";
import { AuthorizationError, NotFoundError } from "../utils/errors";
import { DashboardPlayerService } from "./dashboard-player-service";

export class CompetitionService {
  static async getAllCompetitions() {
    const competitions = await CompetitionRepo.findAll();
    return competitions;
  }

  static async getCompetitionById(id: string) {
    const competition = await CompetitionRepo.findByIdWithDetails(id);
    return competition;
  }

  static async getCompetitionStats(competitionId: string, userId: string) {
    const competition =
      await CompetitionRepo.findByIdWithDetails(competitionId);
    if (!competition) {
      throw new NotFoundError("Competition");
    }
    return transformCompetitionToResponse(competition, userId);
  }

  static async getDetailedCompetitions(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      type?: CompetitionType;
      search?: string;
    } = {}
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
      competitionIds
    );

    const response = transformDashboardCompetitionsToDetailedResponse(
      matchCounts,
      teamCounts,
      playerCounts,
      userRoles,
      competitions
    );

    return {
      competitions: response,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  static async getCompetitionWithPendingVotes(competitionId: string) {
    return await CompetitionVotingRepo.findByIdWithPendingVotes(competitionId);
  }

  static async createCompetition(data: createCompetitionRequest) {
    const dashboardId = await DashboardService.getDashboardIdFromUserId(
      data.userId
    );
    if (!dashboardId) {
      throw new NotFoundError("Dashboard");
    }

    const competitionToAdd = transformAddCompetitionRequestToService(
      data,
      dashboardId
    );
    return await CompetitionRepo.create(competitionToAdd);
  }

  static async resetCompetition(competitionId: string, userId: string) {
    const isAuthorized = await this.canUserModifyCompetition(
      competitionId,
      userId
    );
    if (!isAuthorized) {
      throw new AuthorizationError(
        "User is not authorized to reset this competition"
      );
    }

    const competition =
      await CompetitionRepo.findByIdWithDetails(competitionId);
    if (!competition) {
      throw new NotFoundError("Competition");
    }

    if (competition.type === CompetitionType.DUEL) {
      await CompetitionRepo.resetCompetitionWithoutTeams(competitionId);
    } else {
      await CompetitionRepo.resetCompetition(competitionId);
    }

    await DashboardPlayerService.cleanupUnusedPlayers();
  }

  static async deleteCompetition(competitionId: string, userId: string) {
    const isAuthorized = await this.canUserModifyCompetition(
      competitionId,
      userId
    );
    if (!isAuthorized) {
      throw new AuthorizationError(
        "User is not authorized to delete this competition"
      );
    }
    await TeamService.deleteTeamsOnlyInCompetition(competitionId);

    await CompetitionRepo.delete(competitionId);

    await DashboardPlayerService.cleanupUnusedPlayers();
  }

  static async isUserAdmin(
    competitionId: string,
    userId: string
  ): Promise<boolean> {
    const adminId = await CompetitionAuthRepo.getDashboardAdmin(competitionId);
    return adminId === userId;
  }

  static async isUserModerator(
    competitionId: string,
    userId: string
  ): Promise<boolean> {
    const moderatorIds = await CompetitionAuthRepo.getModerators(competitionId);

    return moderatorIds.includes(userId);
  }

  static async isUserAdminOrModerator(
    competitionId: string,
    userId: string
  ): Promise<boolean> {
    const [adminId, moderatorIds] = await Promise.all([
      CompetitionAuthRepo.getDashboardAdmin(competitionId),
      CompetitionAuthRepo.getModerators(competitionId),
    ]);

    return adminId === userId || moderatorIds.includes(userId);
  }

  static async canUserModifyCompetition(
    competitionId: string,
    userId: string
  ): Promise<boolean> {
    return this.isUserAdmin(competitionId, userId);
  }
}
