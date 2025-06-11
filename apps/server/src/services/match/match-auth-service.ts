import { CompetitionAuthRepo } from "../../repositories/competition/competition-auth-repo";
import { MatchRepo } from "../../repositories/match-repo";

export class MatchAuthService {
  static async canUserCreateMatch(
    competitionId: string,
    userId: string
  ): Promise<boolean> {
    try {
      return await CompetitionAuthRepo.isUserAdminOrModerator(
        competitionId,
        userId
      );
    } catch (error) {
      console.error("Error in MatchAuthService.canUserCreateMatch:", error);
      return false;
    }
  }

  static async canUserModifyMatch(
    matchId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const match = await MatchRepo.findByIdWithDetails(matchId);
      if (!match) return false;

      return await CompetitionAuthRepo.isUserAdminOrModerator(
        match.competition_id,
        userId
      );
    } catch (error) {
      console.error("Error in MatchAuthService.canUserModifyMatch:", error);
      return false;
    }
  }
}
