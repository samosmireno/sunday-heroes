import { Request, Response, NextFunction } from "express";
import { CompetitionService } from "../services/competition-service";
import { CompetitionType } from "@repo/shared-types";
import { sendSuccess } from "../utils/response-utils";
import { extractUserId, getRequiredQuery } from "../utils/request-utils";
import { createCompetitionRequest } from "../schemas/create-competition-request-schema";
import { TeamService } from "../services/team-service";
import { BadRequestError } from "../utils/errors";
import logger from "../logger";

export const getDetailedCompetitions = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
    next(error);
  }
};

export const getCompetitionStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const competitionId = getRequiredQuery(req, "compId");
    const userId = req.query["userId"] as string;

    const competition = await CompetitionService.getCompetitionStats(
      competitionId,
      userId,
    );
    sendSuccess(res, competition);
  } catch (error) {
    next(error);
  }
};

export const getCompetitionInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const competitionId = getRequiredQuery(req, "compId");

    const competition =
      await CompetitionService.getCompetitionInfo(competitionId);
    sendSuccess(res, competition);
  } catch (error) {
    next(error);
  }
};

export const getCompetitionSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const competitionId = getRequiredQuery(req, "compId");
    const userId = getRequiredQuery(req, "userId");

    const competition = await CompetitionService.getCompetitionSettings(
      competitionId,
      userId,
    );
    sendSuccess(res, competition);
  } catch (error) {
    next(error);
  }
};

export const getCompetitionTeams = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const competitionId = getRequiredQuery(req, "compId");

    const competition =
      await CompetitionService.getCompetitionTeams(competitionId);
    sendSuccess(res, competition);
  } catch (error) {
    next(error);
  }
};

export const createCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data: createCompetitionRequest = req.body;

    logger.info(
      { userId: data.userId, type: data.type },
      "Create competition attempt",
    );

    if (!data.userId) {
      throw new BadRequestError("User ID is required");
    }

    const competition = await CompetitionService.createCompetition(data);

    logger.info(
      { userId: data.userId, competitionId: competition.id },
      "Competition created",
    );

    if (data.type === CompetitionType.DUEL) {
      await TeamService.createTeamInCompetition(
        "Home",
        competition.id,
        data.userId,
      );
      await TeamService.createTeamInCompetition(
        "Away",
        competition.id,
        data.userId,
      );

      logger.info(
        { competitionId: competition.id },
        "Teams created for duel competition",
      );
    }

    sendSuccess(res, { competition }, 201);
  } catch (error) {
    next(error);
  }
};

export const resetCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = extractUserId(req);
    const competitionId = req.params.id;

    logger.info({ userId, competitionId }, "Reset competition attempt");

    if (!competitionId) {
      throw new BadRequestError("Competition ID is required");
    }

    const resetCompetition = await CompetitionService.resetCompetition(
      competitionId,
      userId,
    );

    logger.info({ userId, competitionId }, "Competition reset");
    sendSuccess(res, resetCompetition);
  } catch (error) {
    next(error);
  }
};

export const deleteCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = extractUserId(req);
    const competitionId = req.params.id;

    logger.info({ userId, competitionId }, "Delete competition attempt");

    if (!competitionId) {
      throw new BadRequestError("Competition ID is required");
    }

    await CompetitionService.deleteCompetition(competitionId, userId);

    logger.info({ userId, competitionId }, "Competition deleted");
    sendSuccess(res, { message: "Competition deleted successfully" }, 204);
  } catch (error) {
    next(error);
  }
};
