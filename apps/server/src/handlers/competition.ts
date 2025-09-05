import { Request, Response, NextFunction } from "express";
import { CompetitionService } from "../services/competition-service";
import { CompetitionType } from "@repo/shared-types";
import { sendSuccess } from "../utils/response-utils";
import { extractUserId, getRequiredQuery } from "../utils/request-utils";
import { createCompetitionRequest } from "../schemas/create-competition-request-schema";
import { TeamService } from "../services/team-service";
import { BadRequestError } from "../utils/errors";

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
      throw new BadRequestError("User ID is required");
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
      throw new BadRequestError("Competition ID is required");
    }

    const resetCompetition = await CompetitionService.resetCompetition(
      competitionId,
      userId
    );
    sendSuccess(res, resetCompetition);
  } catch (error) {
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
      throw new BadRequestError("Competition ID is required");
    }

    await CompetitionService.deleteCompetition(competitionId, userId);
    sendSuccess(res, { message: "Competition deleted successfully" }, 204);
  } catch (error) {
    next(error);
  }
};
