import { NextFunction, Request, Response } from "express";
import { TeamCompetitionRepo } from "../repositories/team-competition-repo";
import { sendError, sendSuccess } from "../utils/response-utils";
import { extractUserId } from "../utils/request-utils";
import { TeamService } from "../services/team-service";

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

export const deleteTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = extractUserId(req);
    const teamId = req.params.id;
    const { competitionId } = req.body;

    if (!teamId) {
      return sendError(res, "Team ID is required", 400);
    }

    if (!competitionId) {
      return sendError(res, "Competition ID is required", 400);
    }

    await TeamService.deleteTeam(teamId, competitionId, userId);
    sendSuccess(res, { message: "Team deleted successfully" });
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
