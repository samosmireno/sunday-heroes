import { TeamRepo } from "../repositories/team-repo";
import { TeamRosterRepo } from "../repositories/team-roster-repo";
import { CompetitionAuthRepo } from "../repositories/competition/competition-auth-repo";
import { DashboardPlayerRepo } from "../repositories/dashboard-player-repo";
import { DashboardService } from "./dashboard-service";
import { DashboardPlayerService } from "./dashboard-player-service";
import { TeamCompetitionRepo } from "../repositories/team-competition-repo";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from "../utils/errors";
import { PrismaTransaction } from "../types";

export class TeamService {
  static async createTeamInCompetition(
    name: string,
    competitionId: string,
    userId: string
  ) {
    const hasPermission = await CompetitionAuthRepo.isUserAdminOrModerator(
      competitionId,
      userId
    );
    if (!hasPermission) {
      throw new AuthorizationError(
        "User not authorized to create teams in this competition"
      );
    }

    const isUnique = await TeamRepo.checkNameUniqueInCompetition(
      name,
      competitionId
    );
    if (!isUnique) {
      throw new ConflictError(
        `Team name "${name}" already exists in this competition`
      );
    }

    const team = await TeamRepo.create({ name, createdAt: new Date() });
    await TeamCompetitionRepo.addTeamToCompetition(team.id, competitionId);

    return team;
  }

  static async addPlayerToTeam(
    teamId: string,
    nickname: string,
    competitionId: string,
    userId: string
  ) {
    const hasPermission = await CompetitionAuthRepo.isUserAdminOrModerator(
      userId,
      competitionId
    );
    if (!hasPermission) {
      throw new AuthorizationError(
        "User not authorized to manage teams in this competition"
      );
    }

    const team = await TeamRepo.findById(teamId);
    if (!team) {
      throw new NotFoundError("Team");
    }

    const dashboardId =
      await DashboardService.getDashboardIdFromCompetitionId(competitionId);

    await DashboardPlayerService.addMissingPlayers([nickname], dashboardId);

    const player = await DashboardPlayerRepo.findByNickname(
      nickname,
      dashboardId
    );
    if (!player) {
      throw new NotFoundError("Dashboard player");
    }

    const existingTeam = await TeamRosterRepo.getPlayerTeamInCompetition(
      player.id,
      competitionId
    );
    if (existingTeam) {
      throw new ConflictError(
        `Player "${nickname}" is already on a team in this competition`
      );
    }

    const currentPlayerCount = await TeamRosterRepo.getTeamPlayerCount(
      teamId,
      competitionId
    );
    if (currentPlayerCount >= 16) {
      throw new ConflictError(
        `Team "${team.name}" already has the maximum number of players (16)`
      );
    }

    return await TeamRosterRepo.addPlayerToTeam(
      teamId,
      player.id,
      competitionId
    );
  }

  static async removePlayerFromTeam(
    teamId: string,
    playerId: string,
    competitionId: string,
    userId: string
  ) {
    const hasPermission = await CompetitionAuthRepo.isUserAdminOrModerator(
      userId,
      competitionId
    );
    if (!hasPermission) {
      throw new AuthorizationError(
        "User not authorized to manage teams in this competition"
      );
    }

    const isOnTeam = await TeamRosterRepo.isPlayerOnTeam(
      playerId,
      teamId,
      competitionId
    );
    if (!isOnTeam) {
      throw new NotFoundError(
        `Player with ID ${playerId} is not on team with ID ${teamId}`
      );
    }

    await TeamRosterRepo.removePlayerFromTeam(teamId, playerId, competitionId);
  }

  static async getTeamsInCompetition(competitionId: string) {
    return await TeamRepo.findByCompetitionId(competitionId);
  }

  static async getTeamRoster(teamId: string, competitionId: string) {
    return await TeamRosterRepo.getTeamRoster(teamId, competitionId);
  }

  static async deleteTeam(
    teamId: string,
    competitionId: string,
    userId: string
  ) {
    const hasPermission = await CompetitionAuthRepo.isUserAdminOrModerator(
      competitionId,
      userId
    );
    if (!hasPermission) {
      throw new AuthorizationError(
        "User not authorized to delete teams in this competition"
      );
    }

    const team = await TeamRepo.findById(teamId);
    if (!team) {
      throw new NotFoundError("Team");
    }

    await TeamRepo.delete(teamId);

    return { message: "Team deleted successfully" };
  }

  static async deleteTeamsOnlyInCompetition(competitionId: string) {
    const teams = await this.getTeamsInCompetition(competitionId);
    if (!teams || teams.length === 0) {
      return;
    }

    const teamIds = teams
      .filter((team) => team.teamCompetitions.length === 1)
      .map((team) => team.id);

    await TeamRepo.deleteMany(teamIds);
  }
}
