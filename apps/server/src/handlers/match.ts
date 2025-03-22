import { MatchPlayerRepo } from "../repositories/match-player-repo";
import { MatchRepo } from "../repositories/match-repo";
import { NextFunction, Request, Response } from "express";
import { UserRepo } from "../repositories/user-repo";
import { validationResult } from "express-validator";
import { Match, VotingStatus } from "@prisma/client";
import { createMatchRequest, DuelPlayerRequest } from "@repo/logger";
import {
  transformAddMatchRequestToMatchPlayer,
  transformAddMatchRequestToService,
  transformDashboardMatchesToResponse,
  transformMatchServiceToResponse,
} from "../utils/utils";
import { TeamRepo } from "../repositories/team-repo";
import { DashboardPlayerRepo } from "../repositories/dashboard-player-repo";
import { DashboardRepo } from "../repositories/dashboard-repo";

export const getAllMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const matches = await MatchRepo.getAllMatchesWithDetails();
    const matchesResponse = matches.map((match) =>
      transformMatchServiceToResponse(match)
    );
    res.json(matchesResponse);
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
    const match = await MatchRepo.getMatchWithPlayersById(req.params.id);
    if (match) {
      const matchClientFormat = transformMatchServiceToResponse(match);
      res.json(matchClientFormat);
    } else {
      res.status(404).send("Match not found");
    }
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
    const dashboardId = await UserRepo.getDashboardIdFromUserId(userId);
    if (!dashboardId) {
      return res.status(400).send("No dashboard for the given userId");
    }
    const matches = await MatchRepo.getAllMatchesFromDashboard(dashboardId);
    res.json(transformDashboardMatchesToResponse(matches));
  } catch (error) {
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

    const matches = await MatchRepo.getAllMatchesFromCompetition(competitionId);
    const matchesResponse = matches.map((match) =>
      transformMatchServiceToResponse(match)
    );
    res.json(matchesResponse);
  } catch (error) {
    next(error);
  }
};

export const createMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const data: createMatchRequest = req.body;

  const matchToAdd = transformAddMatchRequestToService(data);

  const hometeamID = await TeamRepo.getTeamIDFromName(data.teams[0]);
  const awayteamID = await TeamRepo.getTeamIDFromName(data.teams[1]);

  const dashboardId = await DashboardRepo.getDashboardIdFromCompetitionId(
    data.competitionId
  );

  try {
    const match = await MatchRepo.createMatch(matchToAdd);
    await DashboardPlayerRepo.addMissingUsers(
      [...data.players.map((player) => player.nickname)],
      dashboardId
    );

    await Promise.all(
      data.players.map(async (player: DuelPlayerRequest) => {
        const user = await DashboardPlayerRepo.getDashboardPlayerByNickname(
          player.nickname,
          dashboardId
        );
        if (user === null) {
          throw new Error(`Player ID not found for player: ${player.nickname}`);
        }

        const matchPlayerToAdd = transformAddMatchRequestToMatchPlayer(
          player,
          match.id,
          user.id,
          player.isHome ? hometeamID : awayteamID
        );

        await MatchPlayerRepo.createMatchPlayer(matchPlayerToAdd);
      })
    );

    res.status(201).json(match);
  } catch (error) {
    next(error);
  }
};

export const updateMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const matchId = req.params.id;
  const data: createMatchRequest = req.body;

  const matchToUpdate: Partial<Match> = {
    date: new Date(data.date),
    home_team_score: data.homeTeamScore,
    away_team_score: data.awayTeamScore,
  };

  const hometeamID = await TeamRepo.getTeamIDFromName(data.teams[0]);
  const awayteamID = await TeamRepo.getTeamIDFromName(data.teams[1]);

  const dashboardId = await DashboardRepo.getDashboardIdFromCompetitionId(
    data.competitionId
  );

  try {
    const updatedMatch = await MatchRepo.updateMatch(matchId, matchToUpdate);
    await DashboardPlayerRepo.addMissingUsers(
      [...data.players.map((player) => player.nickname)],
      dashboardId
    );

    await MatchPlayerRepo.deleteMatchPlayersFromMatch(matchId);

    await Promise.all(
      data.players.map(async (player) => {
        const user = await DashboardPlayerRepo.getDashboardPlayerByNickname(
          player.nickname,
          dashboardId
        );
        if (user === null) {
          throw new Error(`Player ID not found for player: ${player.nickname}`);
        }

        const matchPlayerToAdd = transformAddMatchRequestToMatchPlayer(
          player,
          updatedMatch.id,
          user.id,
          player.isHome ? hometeamID : awayteamID
        );

        await MatchPlayerRepo.createMatchPlayer(matchPlayerToAdd);
      })
    );

    await DashboardPlayerRepo.deleteDashboardPlayersWithNoMatches();

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
    const matchId = req.params.id;
    const deletedMatch = await MatchRepo.deleteMatch(matchId);

    if (deletedMatch) {
      res.status(200).send("Match deleted successfully");
    } else {
      res.status(404).send("Match not found");
    }
  } catch (error) {
    next(error);
  }
};
