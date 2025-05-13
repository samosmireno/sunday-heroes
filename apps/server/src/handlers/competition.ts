import e, { Request, Response, NextFunction } from "express";
import { CompetitionRepo } from "../repositories/competition-repo";
import {
  transformCompetitionToResponse,
  transformDashboardCompetitionsToResponse,
  transformAddCompetitionRequestToService,
  transformDashboardCompetitionsToDetailedResponse,
} from "../utils/utils";
import { CompetitionType, createCompetitionRequest } from "@repo/logger";
import { Competition } from "@prisma/client";
import { UserRepo } from "../repositories/user-repo";

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
    console.log(req.query);
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
        page,
        limit,
        type,
        search
      );

    const totalCount = await CompetitionRepo.getNumCompetitionsFromQuery(
      dashboardId,
      type,
      search
    );
    res.setHeader("X-Total-Count", totalCount.toString());

    res.json(transformDashboardCompetitionsToDetailedResponse(competitions));
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
    const competitionId = req.params.id.toString();
    if (!competitionId) {
      return res.status(400).send("dashboardId query parameter is required");
    }
    const competition = await CompetitionRepo.getCompetitionById(competitionId);
    if (competition) {
      const compResponse = transformCompetitionToResponse(competition);
      //console.log(compResponse.matches[0].players[0]);
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
