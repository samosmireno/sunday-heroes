import { Prisma } from "@prisma/client";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";
import prisma from "../prisma-client";

export class DashboardPlayerStatsRepo {
  static async getPlayerCareerStats(
    playerId: string,
    tx?: Prisma.TransactionClient
  ) {
    try {
      const prismaClient = tx || prisma;

      const [aggregations, competitionCount, motmCount, recordStats] =
        await Promise.all([
          prismaClient.matchPlayer.aggregate({
            where: {
              dashboardPlayerId: playerId,
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
              dashboardPlayerId: playerId,
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
              dashboardPlayerId: playerId,
              isMotm: true,
              match: {
                isCompleted: true,
              },
            },
          }),

          prismaClient.matchPlayer.findMany({
            where: {
              dashboardPlayerId: playerId,
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
        avgRating: aggregations._avg.rating || 0,
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
    playerId: string,
    limit: number = 5,
    tx?: Prisma.TransactionClient
  ) {
    try {
      const prismaClient = tx || prisma;

      const recentMatches = await prismaClient.matchPlayer.findMany({
        where: {
          dashboardPlayerId: playerId,
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
}
