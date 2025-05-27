import prisma from "./prisma-client";

export class TeamCompetitionRepo {
  static async getTeamsFromCompetitionId(
    competition_id: string
  ): Promise<string[]> {
    const teams = await prisma.teamCompetition.findMany({
      where: { competition_id },
      select: {
        team: {
          select: {
            name: true,
          },
        },
      },
    });
    return teams.map((tc) => tc.team.name);
  }
}
