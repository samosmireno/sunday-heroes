import { NextFunction, Request, Response } from "express";
import { TeamCompetitionRepo } from "../repositories/team-competition-repo";
import { sendSuccess } from "../utils/response-utils";
import { extractUserId } from "../utils/request-utils";
import { TeamService } from "../services/team-service";
import { BadRequestError } from "../utils/errors";
import logger from "../logger";

export const getTeamListFromCompetitionId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const competitionId = req.params.competitionId;
    if (!competitionId) {
      throw new BadRequestError("Competition ID is required");
    }

    const teams =
      await TeamCompetitionRepo.getTeamsFromCompetitionId(competitionId);
    sendSuccess(res, teams);
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = extractUserId(req);
    const teamId = req.params.id;
    const { competitionId } = req.body;

    logger.info({ userId, teamId }, "Delete team attempt");

    if (!teamId) {
      throw new BadRequestError("Team ID is required");
    }

    if (!competitionId) {
      throw new BadRequestError("Competition ID is required");
    }

    await TeamService.deleteTeam(teamId, competitionId, userId);

    logger.info({ userId, teamId }, "Team deleted");
    sendSuccess(res, { message: "Team deleted successfully" });
  } catch (error) {
    next(error);
  }
};
