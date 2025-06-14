import { Request, Response, NextFunction } from "express";
import { CompetitionModeratorRepo } from "../repositories/competition/competition-moderator-repo";
import { AuthenticatedRequest } from "../types";
import { CompetitionAuthRepo } from "../repositories/competition/competition-auth-repo";
import {
  sendError,
  sendForbiddenError,
  sendSuccess,
} from "../utils/response-utils";

export const addModeratorToCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const adminId = authenticatedReq.userId;
    const competitionId = req.params.id;
    const { userId } = req.body;

    if (!competitionId || !userId) {
      return sendError(res, "Competition ID and User ID are required", 400);
    }

    const isAdmin = await CompetitionAuthRepo.isUserAdmin(
      competitionId,
      adminId
    );
    if (!isAdmin) {
      return sendForbiddenError(
        res,
        "User is not an admin of this competition"
      );
    }

    const isModerator = await CompetitionModeratorRepo.isUserModerator(
      competitionId,
      userId
    );
    if (isModerator) {
      return sendError(res, "User is already a moderator", 409);
    }

    await CompetitionModeratorRepo.addModeratorToCompetition(
      competitionId,
      userId
    );
    sendSuccess(res, { message: "Moderator added successfully" }, 201);
  } catch (error) {
    next(error);
  }
};

export const removeModeratorFromCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const adminId = authenticatedReq.userId;
    const moderatorId = req.params.moderatorId;

    if (!moderatorId) {
      return sendError(res, "Moderator ID is required", 400);
    }

    const competitionId =
      await CompetitionModeratorRepo.getCompetitionIdByModeratorId(moderatorId);
    if (!competitionId) {
      return sendError(res, "Moderator is not found for this competition", 400);
    }
    const isAdmin = await CompetitionAuthRepo.isUserAdmin(
      competitionId,
      adminId
    );
    if (!isAdmin) {
      return sendForbiddenError(
        res,
        "User is not an admin of this competition"
      );
    }

    await CompetitionModeratorRepo.removeModeratorFromCompetition(moderatorId);
    sendSuccess(res, { message: "Moderator removed successfully" });
  } catch (error) {
    next(error);
  }
};
