import prisma from "./prisma-client";

export class TeamRepo {
  static async getTeamIDFromName(team_name: string): Promise<string> {
    const team = await prisma.team.findUnique({ where: { name: team_name } });
    if (!team) {
      throw new Error(`Team with name ${team_name} not found`);
    }
    return team.id;
  }
}
