import { CompetitionAuthRepo } from "../../repositories/competition/competition-auth-repo";
import { CompetitionRepo } from "../../repositories/competition/competition-repo";
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
    const competition = await CompetitionRepo.findByMatchId(matchId);
    if (!competition) return false;

    return await CompetitionAuthRepo.isUserAdminOrModerator(
      competition.id,
      userId
    );
  }
}
