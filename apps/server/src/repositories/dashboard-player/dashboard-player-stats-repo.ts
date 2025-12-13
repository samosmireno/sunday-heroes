import { Prisma } from "@prisma/client";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";
import prisma from "../prisma-client";
import {
  MATCH_PLAYER_WITH_MATCH_DETAILS_SELECT,
  MatchPlayerWithMatchDetails,
} from "../match-player/types";
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

  static async getPerformanceData(
    playerIds: string[],
    competitionId: string,
    range?: number,
    tx?: Prisma.TransactionClient
  ): Promise<MatchPlayerWithMatchDetails[]> {
    try {
      const prismaClient = tx || prisma;

      const matchPlayers = await prismaClient.matchPlayer.findMany({
        where: {
          dashboardPlayerId: { in: playerIds },
          match: {
            isCompleted: true,
            competitionId,
          },
        },
        select: MATCH_PLAYER_WITH_MATCH_DETAILS_SELECT,
        orderBy: {
          match: {
            date: "desc",
          },
        },
        ...(range && { take: range }),
      });

      return matchPlayers;
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerStatsRepo.getPerformanceData"
      );
    }
  }

  static async getTopTeammates(
    playerIds: string[],
    limit: number = 5,
    tx?: Prisma.TransactionClient
  ) {
    try {
      const prismaClient = tx || prisma;

      const result = await prismaClient.$queryRaw<
        Array<{
          dashboardPlayerId: string;
          nickname: string;
          userId: string | null;
          isRegistered: boolean;
          matchesTogether: number;
          wins: number;
          draws: number;
          losses: number;
          winRate: number;
        }>
      >`
      WITH player_matches AS (
        SELECT 
          mp."matchId",
          mp."teamId",
          mp."isHome",
          m."homeTeamScore",
          m."awayTeamScore"
        FROM "MatchPlayer" mp
        JOIN "Match" m ON mp."matchId" = m.id
        WHERE mp."dashboardPlayerId" IN (${Prisma.join(playerIds)})
          AND m."isCompleted" = true
      ),
      teammate_matches AS (
        SELECT 
          mp."dashboardPlayerId",
          mp."matchId",
          pm."teamId",
          pm."isHome",
          pm."homeTeamScore",
          pm."awayTeamScore"
        FROM "MatchPlayer" mp
        JOIN player_matches pm ON mp."matchId" = pm."matchId" 
          AND mp."teamId" = pm."teamId"
        WHERE mp."dashboardPlayerId" NOT IN (${Prisma.join(playerIds)})
      ),
      teammate_stats AS (
        SELECT 
          tm."dashboardPlayerId",
          COUNT(DISTINCT tm."matchId")::int as "matchesTogether",
          SUM(CASE 
            WHEN (tm."isHome" AND tm."homeTeamScore" > tm."awayTeamScore") OR 
                 (NOT tm."isHome" AND tm."awayTeamScore" > tm."homeTeamScore")
            THEN 1 ELSE 0 
          END)::int as wins,
          SUM(CASE 
            WHEN tm."homeTeamScore" = tm."awayTeamScore"
            THEN 1 ELSE 0 
          END)::int as draws,
          SUM(CASE 
            WHEN (tm."isHome" AND tm."homeTeamScore" < tm."awayTeamScore") OR 
                 (NOT tm."isHome" AND tm."awayTeamScore" < tm."homeTeamScore")
            THEN 1 ELSE 0 
          END)::int as losses
        FROM teammate_matches tm
        GROUP BY tm."dashboardPlayerId"
      )
      SELECT 
        dp.id as "dashboardPlayerId",
        dp.nickname,
        (dp."userId" IS NOT NULL) as "isRegistered",
        ts."matchesTogether",
        ts.wins,
        ts.draws,
        ts.losses,
        ROUND((ts.wins::numeric / NULLIF(ts."matchesTogether", 0) * 100))::int as "winRate"
      FROM teammate_stats ts
      JOIN "DashboardPlayer" dp ON ts."dashboardPlayerId" = dp.id
      ORDER BY ts."matchesTogether" DESC, ts.wins DESC
      LIMIT ${limit}
    `;

      return result.map((row) => ({
        dashboardPlayerId: row.dashboardPlayerId,
        nickname: row.nickname,
        isRegistered: row.isRegistered,
        matchesTogether: row.matchesTogether,
        record: {
          wins: row.wins,
          draws: row.draws,
          losses: row.losses,
        },
        winRate: row.winRate,
      }));
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerStatsRepo.getTopTeammates"
      );
    }
  }

  static async getPlayerCompetitionStats(
    playerIds: string[],
    tx?: Prisma.TransactionClient
  ) {
    try {
      const prismaClient = tx || prisma;

      const result = await prismaClient.$queryRaw<
        Array<{
          competitionId: string;
          name: string;
          type: "LEAGUE" | "DUEL" | "KNOCKOUT";
          matches: number;
          wins: number;
          draws: number;
          losses: number;
          goals: number;
          assists: number;
          avgRating: number | null;
        }>
      >`
        SELECT 
          m."competitionId" as "competitionId",
          c."name" as "name",
          c."type" as "type",
          COUNT(DISTINCT mp."matchId")::int AS "matches",
          SUM(
            CASE 
              WHEN (mp."isHome" AND m."homeTeamScore" > m."awayTeamScore") OR 
                   (NOT mp."isHome" AND m."awayTeamScore" > m."homeTeamScore")
              THEN 1 ELSE 0
            END
          )::int AS "wins",
          SUM(
            CASE 
              WHEN m."homeTeamScore" = m."awayTeamScore"
              THEN 1 ELSE 0
            END
          )::int AS "draws",
          SUM(
            CASE 
              WHEN (mp."isHome" AND m."homeTeamScore" < m."awayTeamScore") OR 
                   (NOT mp."isHome" AND m."awayTeamScore" < m."homeTeamScore")
              THEN 1 ELSE 0
            END
          )::int AS "losses",
          COALESCE(SUM(mp.goals), 0)::int AS "goals",
          COALESCE(SUM(mp.assists), 0)::int AS "assists",
          AVG(mp.rating) AS "avgRating"
        FROM "MatchPlayer" mp
        JOIN "Match" m ON mp."matchId" = m.id
        JOIN "Competition" c ON m."competitionId" = c.id
        WHERE mp."dashboardPlayerId" IN (${Prisma.join(playerIds)})
          AND m."isCompleted" = true
        GROUP BY m."competitionId", c."name", c."type"
        ORDER BY c."name" ASC
      `;

      return result.map((row) => ({
        competitionId: row.competitionId,
        name: row.name,
        type: row.type as any,
        matches: row.matches,
        record: {
          wins: row.wins,
          draws: row.draws,
          losses: row.losses,
        },
        goals: row.goals,
        assists: row.assists,
        avgRating: row.avgRating ?? 0,
        goalsPerMatch: row.matches
          ? Number((row.goals / row.matches).toFixed(2))
          : 0,
        assistsPerMatch: row.matches
          ? Number((row.assists / row.matches).toFixed(2))
          : 0,
      }));
    } catch (error) {
      throw PrismaErrorHandler.handle(
        error,
        "DashboardPlayerStatsRepo.getPlayerCompetitionStats"
      );
    }
  }
}
