import { NextFunction, Request, Response } from "express";
import { createMatchRequest } from "@repo/logger";
import { MatchService } from "../services/match-service";
import { AuthenticatedRequest } from "../types";
import { CompetitionRepo } from "../repositories/competition-repo";

export const getAllMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const matches = await MatchService.getAllMatches();
    res.json(matches);
  } catch (error) {
    next(error);
  }
};

export const getMatchById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const match = await MatchService.getMatchById(req.params.id);
    if (!match) {
      return res.status(404).send("Match not found");
    }
    res.json(match);
  } catch (error) {
    next(error);
  }
};

export const getAllMatchesFromDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.query.userId?.toString();
    if (!userId) {
      return res.status(400).send("userId query parameter is required");
    }
    const matches = await MatchService.getDashboardMatches(userId);
    res.json(matches);
  } catch (error) {
    if (error instanceof Error && error.message.includes("No dashboard")) {
      return res.status(400).send(error.message);
    }
    next(error);
  }
};

export const getAllMatchesFromCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const competitionId = req.query.competitionId?.toString();
    if (!competitionId) {
      return res.status(400).send("competitionId query parameter is required");
    }
    const matches = await MatchService.getCompetitionMatches(competitionId);
    res.json(matches);
  } catch (error) {
    next(error);
  }
};

export const getMatchesWithStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.query.userId?.toString();
    if (!userId) {
      return res.status(400).send("userId query parameter is required");
    }
    const page = parseInt(req.query.page?.toString() || "1", 10);
    const limit = parseInt(req.query.limit?.toString() || "8", 10);
    const competitionId = req.query.competitionId?.toString();

    const result = await MatchService.getMatchesWithStats(
      userId,
      competitionId,
      page,
      limit
    );

    res.setHeader("X-Total-Count", result.totalCount.toString());
    res.setHeader("X-Total-Pages", result.totalPages.toString());
    res.json(result.matches);
  } catch (error) {
    if (error instanceof Error && error.message.includes("No dashboard")) {
      return res.status(400).send(error.message);
    }
    next(error);
  }
};

export const createMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.userId;

    const isAdminOrModerator = await CompetitionRepo.isUserAdminOrModerator(
      req.body.competitionId,
      userId
    );
    if (!isAdminOrModerator) {
      return res.status(403).send("You are not authorized to create a match");
    }
    const data: createMatchRequest = req.body;
    const match = await MatchService.createMatch(data);
    res.status(201).json(match);
  } catch (error) {
    next(error);
  }
};

export const updateMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.userId;
    const isAdminOrModerator = await CompetitionRepo.isUserAdminOrModerator(
      req.body.competitionId,
      userId
    );
    if (!isAdminOrModerator) {
      return res.status(403).send("You are not authorized to create a match");
    }
    const matchId = req.params.id;
    const data: createMatchRequest = req.body;

    const updatedMatch = await MatchService.updateMatch(matchId, data);
    res.status(200).json(updatedMatch);
  } catch (error) {
    next(error);
  }
};

export const deleteMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.userId;
    const matchId = req.params.id;
    if (!matchId) {
      return res.status(400).send("Match ID is required");
    }

    const isAdminOrModerator = await MatchService.isUserAdminOrModerator(
      matchId,
      userId
    );
    if (!isAdminOrModerator) {
      return res.status(403).send("You are not authorized to delete a match");
    }

    const deletedMatch = await MatchService.deleteMatch(matchId);

    if (!deletedMatch) {
      return res.status(404).send("Match not found");
    }
    res.status(200).send("Match deleted successfully");
  } catch (error) {
    next(error);
  }
};
