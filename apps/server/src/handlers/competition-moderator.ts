import { Request, Response, NextFunction } from "express";
import { CompetitionModeratorRepo } from "../repositories/competition-moderator-repo";

export const addModeratorToCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const competitionId = req.params.id;
  const { userId } = req.body;

  if (!competitionId || !userId) {
    return res.status(400).send("Competition ID and User ID are required");
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

  try {
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
  const moderatorId = req.params.moderatorId;

  if (!moderatorId) {
    return res.status(400).send("Competition ID and User ID are required");
  }

  try {
    await CompetitionModeratorRepo.removeModeratorFromCompetition(moderatorId);
    res.status(200).send("Moderator removed successfully");
  } catch (error) {
    next(error);
  }
};
