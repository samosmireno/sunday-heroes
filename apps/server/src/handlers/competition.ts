import e, { Request, Response, NextFunction } from "express";
import { CompetitionRepo } from "../repositories/competition-repo";
import {
  transformCompetitionToResponse,
  transformAddCompetitionRequestToService,
} from "../utils/competition-transforms";
import { CompetitionType, createCompetitionRequest } from "@repo/logger";
import { Competition } from "@prisma/client";
import { UserRepo } from "../repositories/user-repo";
import {
  transformDashboardCompetitionsToDetailedResponse,
  transformDashboardCompetitionsToResponse,
} from "../utils/dashboard-transforms";

export const getAllCompetitionsFromDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.query.userId?.toString();
    if (!userId) {
      return res.status(400).send("userId query parameter is required");
    }

    const dashboardId = await UserRepo.getDashboardIdFromUserId(userId);
    if (!dashboardId) {
      return res.status(400).send("No dashboard for the given userId");
    }

    const competitions =
      await CompetitionRepo.getAllCompetitionsFromDashboard(dashboardId);
    res.json(transformDashboardCompetitionsToResponse(competitions));
  } catch (error) {
    next(error);
  }
};

export const getDetailedCompetitions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.query.userId?.toString();
    if (!userId) {
      return res.status(400).send("userId query parameter is required");
    }

    const page = parseInt(req.query.page?.toString() || "0", 10);
    const limit = parseInt(req.query.limit?.toString() || "0", 10);
    const type = req.query.type as CompetitionType;
    const search = req.query.search?.toString();

    const dashboardId = await UserRepo.getDashboardIdFromUserId(userId);
    if (!dashboardId) {
      return res.status(400).send("No dashboard for the given userId");
    }

    const competitions =
      await CompetitionRepo.getAllDetailedCompetitionsFromDashboard(
        dashboardId,
        userId,
        page,
        limit,
        type,
        search
      );

    const totalCount = await CompetitionRepo.getNumCompetitionsFromQuery(
      dashboardId,
      userId,
      type,
      search
    );
    res.setHeader("X-Total-Count", totalCount.toString());

    res.json(
      transformDashboardCompetitionsToDetailedResponse(userId, competitions)
    );
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
    const competitionId = req.query.compId?.toString();
    const userId = req.query.userId?.toString();
    if (!userId) {
      return res.status(400).send("userId query parameter is required");
    }
    if (!competitionId) {
      return res.status(400).send("compId query parameter is required");
    }

    const competition = await CompetitionRepo.getCompetitionById(competitionId);
    if (competition) {
      const compResponse = transformCompetitionToResponse(competition, userId);
      res.json(compResponse);
    } else {
      res.status(404).send("Competition not found");
    }
  } catch (error) {
    next(error);
  }
};

export const createCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data: createCompetitionRequest = req.body;

  const dashboardId = await UserRepo.getDashboardIdFromUserId(data.userId);

  if (!dashboardId) {
    return res.status(400).send("No dashboard for the given userId");
  }

  const competitionToAdd: Omit<Competition, "id"> =
    transformAddCompetitionRequestToService(data, dashboardId);

  try {
    const match = await CompetitionRepo.createCompetition(competitionToAdd);

    res.status(201).json(match);
  } catch (error) {
    next(error);
  }
};
