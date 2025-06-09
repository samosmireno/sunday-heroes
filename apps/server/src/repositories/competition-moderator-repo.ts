import prisma from "./prisma-client";

export class CompetitionModeratorRepo {
  static async addModeratorToCompetition(
    competition_id: string,
    userId: string
  ): Promise<void> {
    await prisma.competitionModerator.create({
      data: {
        competition_id,
        dashboard_player_id: userId,
      },
    });
  }

  static async removeModeratorFromCompetition(id: string): Promise<void> {
    await prisma.competitionModerator.deleteMany({
      where: {
        id,
      },
    });
  }

  static async getModeratorsByCompetitionId(
    competition_id: string
  ): Promise<string[]> {
    const moderators = await prisma.competitionModerator.findMany({
      where: { competition_id },
      select: { dashboard_player_id: true },
    });
    return moderators.map((mod) => mod.dashboard_player_id);
  }

  static async getCompetitionIdByModeratorId(
    moderatorId: string
  ): Promise<string | null> {
    const competition = await prisma.competitionModerator.findFirst({
      where: { id: moderatorId },
      select: { competition_id: true },
    });
    return competition ? competition.competition_id : null;
  }

  static async isUserModerator(
    competition_id: string,
    userId: string
  ): Promise<boolean> {
    const count = await prisma.competitionModerator.count({
      where: {
        competition_id,
        dashboard_player_id: userId,
      },
    });
    return count > 0;
  }
}
