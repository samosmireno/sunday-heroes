import { CompetitionAuthRepo } from "../../repositories/competition/competition-auth-repo";

export class MatchAuthService {
  static async canUserCreateMatch(
    competitionId: string,
    userId: string,
  ): Promise<boolean> {
    return await CompetitionAuthRepo.isUserAdminOrModerator(
      competitionId,
      userId,
    );
  }
}
