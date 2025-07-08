import { Request, Response, NextFunction } from "express";
import { CompetitionService } from "../services/competition-service";
import { CompetitionType } from "@repo/shared-types";
import { sendError, sendSuccess } from "../utils/response-utils";
import { extractUserId } from "../utils/request-utils";
import { createCompetitionRequest } from "../schemas/create-competition-request-schema";
import { TeamService } from "../services/team-service";

const getRequiredQuery = (req: Request, param: string): string => {
  const value = req.query[param]?.toString();
  if (!value) {
    throw new Error(`${param} query parameter is required`);
  }
  return value;
};

export const getAllCompetitionsFromDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getRequiredQuery(req, "userId");
    const competitions =
      await CompetitionService.getDashboardCompetitions(userId);
    sendSuccess(res, competitions);
  } catch (error) {
    if (error instanceof Error && error.message.includes("No dashboard")) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

export const getDetailedCompetitions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getRequiredQuery(req, "userId");
    const page = parseInt(req.query.page?.toString() || "0", 10);
    const limit = parseInt(req.query.limit?.toString() || "10", 10);
    const type = req.query.type as CompetitionType;
    const search = req.query.search?.toString();

    const result = await CompetitionService.getDetailedCompetitions(userId, {
      page,
      limit,
      type,
      search,
    });

    res.setHeader("X-Total-Count", result.totalCount.toString());
    res.setHeader("X-Total-Pages", result.totalPages.toString());
    res.setHeader("X-Current-Page", page.toString());

    sendSuccess(res, result.competitions);
  } catch (error) {
    if (error instanceof Error && error.message.includes("No dashboard")) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

export const getCompetitionStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const competitionId = getRequiredQuery(req, "compId");
    const userId = getRequiredQuery(req, "userId");

    const competition = await CompetitionService.getCompetitionStats(
      competitionId,
      userId
    );
    sendSuccess(res, competition);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

export const createCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data: createCompetitionRequest = req.body;

    if (!data.userId) {
      return sendError(res, "User ID is required", 400);
    }

    const competition = await CompetitionService.createCompetition(data);

    if (data.type === CompetitionType.DUEL) {
      await TeamService.createTeamInCompetition(
        "Home",
        competition.id,
        data.userId
      );
      await TeamService.createTeamInCompetition(
        "Away",
        competition.id,
        data.userId
      );
    }

    sendSuccess(res, competition, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("No dashboard")) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
};

export const resetCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    const competitionId = req.params.id;

    if (!competitionId) {
      return sendError(res, "Competition ID is required", 400);
    }

    const resetCompetition = await CompetitionService.resetCompetition(
      competitionId,
      userId
    );
    sendSuccess(res, resetCompetition);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not authorized")) {
        return sendError(res, error.message, 403);
      }
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
    }
    next(error);
  }
};

export const deleteCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    const competitionId = req.params.id;

    if (!competitionId) {
      return sendError(res, "Competition ID is required", 400);
    }

    await CompetitionService.deleteCompetition(competitionId, userId);
    sendSuccess(res, { message: "Competition deleted successfully" }, 204);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not authorized")) {
        return sendError(res, error.message, 403);
      }
      if (error.message.includes("not found")) {
        return sendError(res, error.message, 404);
      }
    }
    next(error);
  }
};
