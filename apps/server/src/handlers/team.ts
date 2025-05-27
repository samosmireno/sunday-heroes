import { NextFunction, Request, Response } from "express";
import { TeamCompetitionRepo } from "../repositories/team-competition-repo";

export const getTeamListFromCompetitionId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const competitionId = req.params.competitionId;
    if (!competitionId) {
      return res.status(400).send("Competition ID is required");
    }

    const teams =
      await TeamCompetitionRepo.getTeamsFromCompetitionId(competitionId);
    res.json(teams);
  } catch (error) {
    next(error);
  }
};
