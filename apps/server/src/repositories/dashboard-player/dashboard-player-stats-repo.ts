import { Prisma } from "@prisma/client";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";
import prisma from "../prisma-client";
import { MATCH_PLAYER_WITH_MATCH_DETAILS_SELECT } from "../match-player/types";
import { AggregateCompetition } from "@repo/shared-types";

export class DashboardPlayerStatsRepo {
  static async getPlayerCareerStats(
    playerIds: string[],
    tx?: Prisma.TransactionClient
  ) {
    try {
      const prismaClient = tx || prisma;

      const [aggregations, competitionCount, motmCount, recordStats] =
        await Promise.all([
          prismaClient.matchPlayer.aggregate({
            where: {
              dashboardPlayerId: { in: playerIds },
              match: {
                isCompleted: true,
              },
            },
            _count: {
              id: true,
            },
            _sum: {
              goals: true,
              assists: true,
            },
            _avg: {
              rating: true,
            },
          }),

          prismaClient.matchPlayer.findMany({
            where: {
              dashboardPlayerId: { in: playerIds },
              match: {
                isCompleted: true,
              },
            },
            select: {
              match: {
                select: {
                  competitionId: true,
                },
              },
            },
            distinct: ["matchId"],
          }),

          prismaClient.matchPlayer.count({
            where: {
              dashboardPlayerId: { in: playerIds },
              isMotm: true,
              match: {
                isCompleted: true,
              },
            },
          }),

          prismaClient.matchPlayer.findMany({
            where: {
              dashboardPlayerId: { in: playerIds },
              match: {
                isCompleted: true,
              },
            },
            select: {
              isHome: true,
              match: {
                select: {
                  homeTeamScore: true,
                  awayTeamScore: true,
                },
              },
            },
          }),
        ]);

      let wins = 0;
      let draws = 0;
      let losses = 0;

      recordStats.forEach((mp) => {
        const playerScore = mp.isHome
          ? mp.match.homeTeamScore
          : mp.match.awayTeamScore;
        const opponentScore = mp.isHome
          ? mp.match.awayTeamScore
          : mp.match.homeTeamScore;

        if (playerScore > opponentScore) wins++;
        else if (playerScore === opponentScore) draws++;
        else losses++;
      });

      const uniqueCompetitions = new Set(
        competitionCount.map((mp) => mp.match.competitionId)
      );

      return {
        totalMatches: aggregations._count.id,
        totalGoals: aggregations._sum.goals || 0,
        totalAssists: aggregations._sum.assists || 0,
        avgRating: Math.round((aggregations._avg.rating || 0) * 100) / 100,
        totalCompetitions: uniqueCompetitions.size,
        record: { wins, draws, losses },
        manOfTheMatchCount: motmCount,
      };
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerStatsRepo.getPlayerCareerStats"
      );
    }
  }

  static async getRecentForm(
    playerIds: string[],
    limit: number = 5,
    tx?: Prisma.TransactionClient
  ) {
    try {
      const prismaClient = tx || prisma;

      const recentMatches = await prismaClient.matchPlayer.findMany({
        where: {
          dashboardPlayerId: { in: playerIds },
          match: {
            isCompleted: true,
          },
        },
        select: {
          goals: true,
          assists: true,
          rating: true,
          isHome: true,
          match: {
            select: {
              id: true,
              date: true,
              homeTeamScore: true,
              awayTeamScore: true,
              matchTeams: {
                select: {
                  team: {
                    select: {
                      name: true,
                    },
                  },
                  isHome: true,
                },
              },
              competition: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          match: {
            date: "desc",
          },
        },
        take: limit,
      });

      return recentMatches.map((mp) => {
        const playerScore = mp.isHome
          ? mp.match.homeTeamScore
          : mp.match.awayTeamScore;
        const opponentScore = mp.isHome
          ? mp.match.awayTeamScore
          : mp.match.homeTeamScore;

        let result: "W" | "D" | "L";
        if (playerScore > opponentScore) result = "W";
        else if (playerScore === opponentScore) result = "D";
        else result = "L";

        const opponentTeam = mp.match.matchTeams.find(
          (mt) => mt.isHome !== mp.isHome
        );

        return {
          matchId: mp.match.id,
          result,
          goals: mp.goals,
          assists: mp.assists,
          rating: mp.rating || 0,
          opponent: opponentTeam?.team.name || "Unknown",
          score: `${playerScore}-${opponentScore}`,
          date: mp.match.date?.toLocaleDateString() || "",
          competitionName: mp.match.competition.name,
        };
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerStatsRepo.getRecentForm"
      );
    }
  }

  static async getTopMatches(
    playerIds: string[],
    tx?: Prisma.TransactionClient
  ) {
    try {
      const prismaClient = tx || prisma;

      const [topGoalsMatch, topAssistsMatch, topRatingMatch] =
        await Promise.all([
          prismaClient.matchPlayer.findFirst({
            where: {
              dashboardPlayerId: { in: playerIds },
            },
            select: MATCH_PLAYER_WITH_MATCH_DETAILS_SELECT,
            orderBy: [{ goals: "desc" }, { match: { date: "desc" } }],
          }),

          prismaClient.matchPlayer.findFirst({
            where: {
              dashboardPlayerId: { in: playerIds },
            },
            select: MATCH_PLAYER_WITH_MATCH_DETAILS_SELECT,
            orderBy: [{ assists: "desc" }, { match: { date: "desc" } }],
          }),

          prismaClient.matchPlayer.findFirst({
            where: {
              dashboardPlayerId: { in: playerIds },
              rating: {
                not: null,
              },
            },
            select: MATCH_PLAYER_WITH_MATCH_DETAILS_SELECT,
            orderBy: [{ rating: "desc" }, { match: { date: "desc" } }],
          }),
        ]);

      return {
        topGoals: topGoalsMatch,
        topAssists: topAssistsMatch,
        topRating: topRatingMatch,
      };
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerStatsRepo.getTopMatches"
      );
    }
  }

  static async getCompetitionStats(
    playerIds: string[],
    tx?: Prisma.TransactionClient
  ): Promise<AggregateCompetition[]> {
    try {
      const prismaClient = tx || prisma;

      return await prismaClient.$queryRaw`
        SELECT 
          m."competitionId",
          c."name" as "competitionName",
          c."type" as "competitionType",
          mp."dashboardPlayerId",
          COUNT(*)::int as "matchCount",
          SUM(mp.goals)::int as "totalGoals",
          SUM(mp.assists)::int as "totalAssists",
          AVG(mp.rating) as "avgRating"
        FROM "MatchPlayer" mp
        JOIN "Match" m ON mp."matchId" = m.id
        JOIN "Competition" c ON m."competitionId" = c.id
        WHERE mp."dashboardPlayerId" IN (${Prisma.join(playerIds)})
          AND m."isCompleted" = true
        GROUP BY m."competitionId", c."name", c."type", mp."dashboardPlayerId"
        ORDER BY m."competitionId", mp."dashboardPlayerId"
      `;
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerStatsRepo.getTopCompetitions"
      );
    }
  }
}
