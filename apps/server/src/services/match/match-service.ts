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
    const match = await MatchRepo.findByIdWithDetails(matchId);
    if (!match) {
      throw new NotFoundError("Match");
    }
    return match.competition?.type || null;
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

    if (competitionId) {
      matches = await MatchRepo.findByCompetitionId(competitionId, {
        limit,
        offset,
      });
    } else {
      const [userMatches, dashboardMatches] = await Promise.all([
        MatchRepo.findByPlayerId(userId, { limit, offset }),
        MatchRepo.findByDashboardId(dashboardId, { limit, offset }),
      ]);

      matches = this.mergeAndDeduplicateMatches(userMatches, dashboardMatches);
    }

    return {
      matches: transformMatchesToMatchesResponse(userId, matches),
      totalCount: matches.length,
      totalPages: Math.ceil(matches.length / limit),
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

  private static mergeAndDeduplicateMatches(
    userMatches: MatchWithDetails[],
    dashboardMatches: MatchWithDetails[]
  ): MatchWithDetails[] {
    const matchMap = new Map<string, MatchWithDetails>();
    userMatches.forEach((match) => matchMap.set(match.id, match));
    dashboardMatches.forEach((match) => {
      if (match.matchPlayers && Array.isArray(match.matchPlayers)) {
        matchMap.set(match.id, match as MatchWithDetails);
      }
    });
    return Array.from(matchMap.values()).sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }
}
