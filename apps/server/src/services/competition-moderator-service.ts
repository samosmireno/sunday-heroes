import { CompetitionAuthRepo } from "../repositories/competition/competition-auth-repo";
import { CompetitionModeratorRepo } from "../repositories/competition/competition-moderator-repo";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from "../utils/errors";

export class CompetitionModeratorService {
  static async addModeratorToCompetition(
    competitionId: string,
    userId: string
  ) {
    const isModerator = await CompetitionModeratorRepo.isUserModerator(
      competitionId,
      userId
    );
    if (isModerator) {
      throw new ConflictError(
        "User is already a moderator of this competition"
      );
    }

    await CompetitionModeratorRepo.addModeratorToCompetition(
      competitionId,
      userId
    );
  }

  static async removeModeratorFromCompetition(
    moderatorId: string,
    adminId: string
  ) {
    const competitionId =
      await CompetitionModeratorRepo.getCompetitionIdByModeratorId(moderatorId);
    if (!competitionId) {
      throw new NotFoundError("Moderator not found in any competition");
    }

    const isAdmin = await CompetitionAuthRepo.isUserAdmin(
      competitionId,
      adminId
    );
    if (!isAdmin) {
      throw new AuthorizationError("User is not an admin of this competition");
    }

    await CompetitionModeratorRepo.removeModeratorFromCompetition(moderatorId);
  }
}
