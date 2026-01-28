import { Request, Response, NextFunction } from "express";
import { CompetitionAuthRepo } from "../repositories/competition/competition-auth-repo";
import { sendSuccess } from "../utils/response-utils";
import { AuthorizationError, BadRequestError } from "../utils/errors";
import { CompetitionModeratorService } from "../services/competition-moderator-service";
import { extractUserId } from "../utils/request-utils";
import logger from "../logger";

export const addModeratorToCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const adminId = extractUserId(req);
    const competitionId = req.params.id;
    const { userId } = req.body;

    logger.info({ adminId, competitionId, userId }, "Add moderator attempt");

    if (!competitionId || !userId) {
      throw new BadRequestError(
        "Competition ID and User ID are required to add a moderator",
      );
    }

    const isAdmin = await CompetitionAuthRepo.isUserAdmin(
      competitionId,
      adminId,
    );
    if (!isAdmin) {
      throw new AuthorizationError("User is not an admin of this competition");
    }

    await CompetitionModeratorService.addModeratorToCompetition(
      competitionId,
      userId,
    );

    logger.info(
      { adminId, competitionId, userId },
      "Moderator added successfully",
    );
    sendSuccess(res, { message: "Moderator added successfully" }, 201);
  } catch (error) {
    next(error);
  }
};

export const removeModeratorFromCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const adminId = extractUserId(req);
    const moderatorId = req.params.moderatorId;

    logger.info({ adminId, moderatorId }, "Remove moderator attempt");

    if (!moderatorId) {
      throw new BadRequestError(
        "Moderator ID is required to remove a moderator",
      );
    }

    await CompetitionModeratorService.removeModeratorFromCompetition(
      moderatorId,
      adminId,
    );
    logger.info({ adminId, moderatorId }, "Moderator removed successfully");
    sendSuccess(res, { message: "Moderator removed successfully" });
  } catch (error) {
    next(error);
  }
};
