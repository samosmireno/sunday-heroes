import { NextFunction, Request, Response } from "express";
import { TeamCompetitionRepo } from "../repositories/team-competition-repo";
import { sendError, sendSuccess } from "../utils/response-utils";

export const getTeamListFromCompetitionId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const competitionId = req.params.competitionId;
    if (!competitionId) {
      return sendError(res, "Competition ID is required", 400);
    }

    const teams =
      await TeamCompetitionRepo.getTeamsFromCompetitionId(competitionId);
    sendSuccess(res, teams);
  } catch (error) {
    next(error);
  }
};
