import { Request, Response, NextFunction } from "express";
import { DashboardPlayerService } from "../services/dashboard-player-service";
import { sendSuccess } from "../utils/response-utils";
import { extractUserId } from "../utils/request-utils";
import { BadRequestError, ValidationError } from "../utils/errors";
import logger from "../logger";

export const getAllDashboardPlayers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.query.userId?.toString();
    const competitionId = req.query.competitionId?.toString();

    if (!userId) {
      throw new BadRequestError("userId query parameter is required");
    }

    if (!competitionId) {
      throw new BadRequestError("competitionId query parameter is required");
    }

    const query = req.query.query?.toString();

    const players = await DashboardPlayerService.getDashboardPlayersByQuery(
      userId,
      competitionId,
      query || "",
    );
    sendSuccess(res, players);
  } catch (error) {
    next(error);
  }
};

export const getAllDashboardPlayersWithDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.query.userId?.toString();
    if (!userId) {
      throw new BadRequestError("userId query parameter is required");
    }

    const page = parseInt(req.query.page?.toString() || "0", 10);
    const limit = parseInt(req.query.limit?.toString() || "10", 10);
    const search = req.query.search?.toString();

    const result = await DashboardPlayerService.getDashboardPlayers(userId, {
      page,
      limit,
      search,
    });
    res.setHeader("X-Total-Count", result.totalCount.toString());
    res.setHeader("X-Total-Pages", result.totalPages.toString());
    res.setHeader("X-Current-Page", page.toString());

    sendSuccess(res, result.players);
  } catch (error) {
    next(error);
  }
};

export const getMyDashboardTeammates = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.query.userId?.toString();
    if (!userId) {
      throw new BadRequestError("userId query parameter is required");
    }

    const page = parseInt(req.query.page?.toString() || "0", 10);
    const limit = parseInt(req.query.limit?.toString() || "10", 10);
    const search = req.query.search?.toString();

    const result = await DashboardPlayerService.getDashboardPlayersForUser(
      userId,
      {
        page,
        limit,
        search,
      },
    );
    res.setHeader("X-Total-Count", result.totalCount.toString());
    res.setHeader("X-Total-Pages", result.totalPages.toString());
    res.setHeader("X-Current-Page", page.toString());

    sendSuccess(res, result.players);
  } catch (error) {
    next(error);
  }
};

export const createDashboardPlayer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = extractUserId(req);
    const { nickname } = req.body;

    logger.info({ userId, nickname }, "Create dashboard player attempt");

    if (!nickname) {
      throw new ValidationError([
        {
          field: "nickname",
          message: "Nickname is required",
          code: "REQUIRED",
        },
      ]);
    }

    const player = await DashboardPlayerService.createDashboardPlayer(userId, {
      nickname,
    });

    logger.info({ userId, playerId: player.id }, "Dashboard player created");
    sendSuccess(res, player, 201);
  } catch (error) {
    next(error);
  }
};
