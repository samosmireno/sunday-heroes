import { Request, Response, NextFunction } from "express";
import { CompetitionRepo } from "../repositories/competition-repo";
import {
  transformCompetitionToResponse,
  transformDashboardCompetitionsToResponse,
  transformAddCompetitionRequestToService,
} from "../utils/utils";
import { createCompetitionRequest } from "@repo/logger";
import { Competition } from "@prisma/client";

export const getAllCompetitionsFromDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dashboardId = req.query.dashboardId?.toString();
    if (!dashboardId) {
      return res.status(400).send("dashboardId query parameter is required");
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
  console.log("Entered create comptetition");
  const data: createCompetitionRequest = req.body;

  const competitionToAdd: Omit<Competition, "id"> =
    transformAddCompetitionRequestToService(data);

  try {
    const match = await CompetitionRepo.createCompetition(competitionToAdd);

    res.status(201).json(match);
  } catch (error) {
    next(error);
  }
};
