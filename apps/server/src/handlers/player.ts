import { Request, Response, NextFunction } from "express";
import { DashboardPlayerService } from "../services/dashboard-player-service";
import { sendError, sendSuccess } from "../utils/response-utils";
import { extractUserId } from "../utils/request-utils";

export const getAllDashboardPlayers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.query.userId?.toString();
    if (!userId) {
      return sendError(res, "userId query parameter is required", 400);
    }

    const query = req.query.query?.toString();

    if (query) {
      const players = await DashboardPlayerService.getDashboardPlayersByQuery(
        userId,
        query
      );
      sendSuccess(res, players);
    } else {
      return sendError(res, "query parameter is required", 400);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("No dashboard")) {
      return sendError(res, error.message, 400);
    }
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
      return sendError(res, "userId query parameter is required", 400);
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
    if (error instanceof Error && error.message.includes("No dashboard")) {
      return sendError(res, error.message, 400);
    }
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
      return sendError(res, "Nickname is required", 400);
    }

    const player = await DashboardPlayerService.createDashboardPlayer(userId, {
      nickname,
    });
    sendSuccess(res, player, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return sendError(res, error.message, 409);
      }
      if (error.message.includes("Only dashboard admin")) {
        return sendError(res, error.message, 403);
      }
    }
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
      return sendError(res, "Player ID is required", 400);
    }

    const player = await DashboardPlayerService.updateDashboardPlayer(
      playerId,
      userId,
      { nickname, user_id }
    );
    sendSuccess(res, player);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      if (error.message.includes("Only dashboard admin")) {
        return sendError(res, error.message, 403);
      }
      if (error.message.includes("already exists")) {
        return sendError(res, error.message, 409);
      }
    }
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
      return sendError(res, "Player ID is required", 400);
    }

    await DashboardPlayerService.deleteDashboardPlayer(playerId, userId);
    sendSuccess(res, { message: "Player deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
      if (error.message.includes("Only dashboard admin")) {
        return sendError(res, error.message, 403);
      }
    }
    next(error);
  }
};
