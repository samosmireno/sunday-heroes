import { Request, Response, NextFunction } from "express";
import { CompetitionModeratorRepo } from "../repositories/competition-moderator-repo";
import { AuthenticatedRequest } from "../types";
import { CompetitionRepo } from "../repositories/competition-repo";

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
      return res.status(400).send("Competition ID and User ID are required");
    }

    const isAdmin = await CompetitionRepo.isUserAdmin(competitionId, adminId);
    if (!isAdmin) {
      return res.status(403).send("User is not an admin of this competition");
    }

    const isModerator = await CompetitionModeratorRepo.isUserModerator(
      competitionId,
      userId
    );
    if (isModerator) {
      return res
        .status(400)
        .send("User is already a moderator for this competition");
    }

    await CompetitionModeratorRepo.addModeratorToCompetition(
      competitionId,
      userId
    );
    res.status(201).send("Moderator added successfully");
  } catch (error) {
    next(error);
  }
};

export const removeModeratorFromCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const adminId = authenticatedReq.userId;
  const moderatorId = req.params.moderatorId;

  if (!moderatorId) {
    return res.status(400).send("Competition ID and User ID are required");
  }

  const competitionId =
    await CompetitionModeratorRepo.getCompetitionIdByModeratorId(moderatorId);
  if (!competitionId) {
    return res.status(404).send("Moderator not found for this competition");
  }
  const isAdmin = await CompetitionRepo.isUserAdmin(competitionId, adminId);
  if (!isAdmin) {
    return res.status(403).send("User is not an admin of this competition");
  }

  try {
    await CompetitionModeratorRepo.removeModeratorFromCompetition(moderatorId);
    res.status(200).send("Moderator removed successfully");
  } catch (error) {
    next(error);
  }
};
