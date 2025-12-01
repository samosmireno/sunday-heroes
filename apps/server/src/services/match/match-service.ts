import { MatchRepo, MatchWithDetails } from "../../repositories/match-repo";
import { MatchCreationService } from "./match-creation-service";
import { MatchVotingService } from "./match-voting-service";
import {
  transformMatchServiceToResponse,
  transformMatchesToMatchesResponse,
} from "../../utils/match-transforms";
import { createMatchRequest } from "../../schemas/create-match-request-schema";
import { DashboardService } from "../dashboard-service";
import { CompetitionType } from "@prisma/client";
import { ConflictError, NotFoundError } from "../../utils/errors";
import { CompetitionRepo } from "../../repositories/competition/competition-repo";

export class MatchService {
  static async getAllMatches() {
    const matches = await MatchRepo.findAllWithDetails();
    return matches.map(transformMatchServiceToResponse);
  }

  static async getMatchById(id: string) {
    const match = await MatchRepo.findByIdWithDetails(id);
    return match ? transformMatchServiceToResponse(match) : null;
  }

  static async getCompetitionMatches(competitionId: string) {
    const matches = await MatchRepo.findByCompetitionId(competitionId);
    return matches.map(transformMatchServiceToResponse);
  }

  static async getCompetitionTypeFromMatchId(
    matchId: string
  ): Promise<CompetitionType> {
    const competition = await CompetitionRepo.findByMatchId(matchId);
    if (!competition) {
      throw new NotFoundError("Match");
    }
    return competition?.type || null;
  }

  static async getMatchesForUser(
    userId: string,
    options: {
      competitionId?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const dashboardId = await DashboardService.getDashboardIdFromUserId(userId);
    if (!dashboardId) {
      throw new NotFoundError("Dashboard");
    }

    const { competitionId, limit = 10, offset = 0 } = options;

    let matches: MatchWithDetails[];
    let totalCount: number;

    if (competitionId) {
      matches = await MatchRepo.findByCompetitionId(competitionId, {
        limit,
        offset,
      });
      totalCount = await MatchRepo.countByCompetitionId(competitionId);
    } else {
      matches = await MatchRepo.findByUserWithDeduplication(
        userId,
        dashboardId,
        {
          limit,
          offset,
        }
      );
      totalCount = await MatchRepo.countByUserWithDeduplication(
        userId,
        dashboardId
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

  static async updateMatch(matchId: string, data: createMatchRequest) {
    return MatchCreationService.updateMatch(matchId, data);
  }

  static async deleteMatch(matchId: string) {
    const competition = await CompetitionRepo.findByMatchId(matchId);
    if (!competition) {
      throw new NotFoundError("Competition");
    }

    if (competition.type !== CompetitionType.DUEL) {
      throw new ConflictError(
        "Cannot delete match in a league/knockout competition"
      );
    }

    return MatchRepo.delete(matchId);
  }

  static async closeExpiredVoting() {
    return MatchVotingService.closeExpiredVoting();
  }
}
