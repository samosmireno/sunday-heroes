import { CompetitionAuthRepo } from "../../repositories/competition/competition-auth-repo";
import { MatchRepo } from "../../repositories/match-repo";

export class MatchAuthService {
  static async canUserCreateMatch(
    competitionId: string,
    userId: string
  ): Promise<boolean> {
    return await CompetitionAuthRepo.isUserAdminOrModerator(
      competitionId,
      userId
    );
  }

  static async canUserModifyMatch(
    matchId: string,
    userId: string
  ): Promise<boolean> {
    const match = await MatchRepo.findByIdWithDetails(matchId);
    if (!match) return false;

    return await CompetitionAuthRepo.isUserAdminOrModerator(
      match.competition_id,
      userId
    );
  }
}
