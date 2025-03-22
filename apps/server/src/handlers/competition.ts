import { Request, Response, NextFunction } from "express";
import { CompetitionRepo } from "../repositories/competition-repo";
import {
  transformCompetitionToResponse,
  transformDashboardCompetitionsToResponse,
  transformAddCompetitionRequestToService,
} from "../utils/utils";
import { createCompetitionRequest } from "@repo/logger";
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
      res.json(transformCompetitionToResponse(competition));
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

  console.log("Competition to add:", competitionToAdd);

  try {
    const match = await CompetitionRepo.createCompetition(competitionToAdd);

    res.status(201).json(match);
  } catch (error) {
    next(error);
  }
};
