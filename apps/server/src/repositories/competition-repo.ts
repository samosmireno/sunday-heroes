import { Competition, Prisma } from "@prisma/client";
import prisma from "./prisma-client";

export type CompetitionWithMatches = Prisma.CompetitionGetPayload<{
  include: {
    matches: true;
    team_competitions: true;
  };
}>;

export class CompetitionRepo {
  static async getAllCompetitionsFromDashboard(
    dashboard_id: string
  ): Promise<CompetitionWithMatches[]> {
    return prisma.competition.findMany({
      where: {
        dashboard_id,
      },
      include: {
        matches: true,
        team_competitions: true,
      },
    });
  }
}
