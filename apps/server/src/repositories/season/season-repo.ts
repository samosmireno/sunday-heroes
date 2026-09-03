import { Prisma, Season } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaErrorHandler } from "../../utils/prisma-error-handler";
import { SeasonWithCounts } from "./types";

export class SeasonRepo {
  /** The Current season (see `isCurrentSeason`). */
  static async findCurrent(
    competitionId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Season | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.season.findFirst({
        where: { competitionId, endedAt: null },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "SeasonRepo.findCurrent");
    }
  }

  static async create(
    data: { competitionId: string; number: number; startedAt: Date },
    tx?: Prisma.TransactionClient,
  ): Promise<Season> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.season.create({ data });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "SeasonRepo.create");
    }
  }

  /** Every Season of the Competition, ascending by number, with its Match counts. */
  static async listWithCounts(
    competitionId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<SeasonWithCounts[]> {
    try {
      const prismaClient = tx || prisma;
      const [seasons, completedBySeason] = await Promise.all([
        prismaClient.season.findMany({
          where: { competitionId },
          orderBy: { number: "asc" },
          include: { _count: { select: { matches: true } } },
        }),
        prismaClient.match.groupBy({
          by: ["seasonId"],
          where: { competitionId, isCompleted: true },
          _count: { _all: true },
        }),
      ]);

      const completedCounts = new Map(
        completedBySeason.map((row) => [row.seasonId, row._count._all]),
      );

      return seasons.map(({ _count, ...season }) => ({
        ...season,
        matchCount: _count.matches,
        completedMatchCount: completedCounts.get(season.id) ?? 0,
      }));
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "SeasonRepo.listWithCounts");
    }
  }
}
