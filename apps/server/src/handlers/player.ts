import { Request, Response, NextFunction } from "express";
import { DashboardPlayerService } from "../services/dashboard-player-service";
import { sendSuccess } from "../utils/response-utils";
import { extractUserId } from "../utils/request-utils";
import { BadRequestError, ValidationError } from "../utils/errors";

export const getAllDashboardPlayers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.query.userId?.toString();
    if (!userId) {
      throw new BadRequestError("userId query parameter is required");
    }

    const query = req.query.query?.toString();

    const players = await DashboardPlayerService.getDashboardPlayersByQuery(
      userId,
      query || ""
    );
    sendSuccess(res, players);
  } catch (error) {
    next(error);
  }
};

export const getAllDashboardPlayersWithDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
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

export const createDashboardPlayer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    const { nickname } = req.body;

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
    sendSuccess(res, player, 201);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardPlayer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    const playerId = req.params.id;
    const { nickname, user_id } = req.body;

    if (!playerId) {
      throw new BadRequestError("Player ID is required");
    }

    const player = await DashboardPlayerService.updateDashboardPlayer(
      playerId,
      userId,
      { nickname, user_id }
    );
    sendSuccess(res, player);
  } catch (error) {
    next(error);
  }
};

export const deleteDashboardPlayer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    const playerId = req.params.id;

    if (!playerId) {
      throw new BadRequestError("Player ID is required");
    }

    await DashboardPlayerService.deleteDashboardPlayer(playerId, userId);
    sendSuccess(res, { message: "Player deleted successfully" });
  } catch (error) {
    next(error);
  }
};
