import { MatchPlayerRepo } from "../repositories/match-player-repo";
import { MatchRepo, MatchWithDetails } from "../repositories/match-repo";
import { NextFunction, Request, Response } from "express";
import { UserRepo } from "../repositories/user-repo";
import { validationResult } from "express-validator";
import { Match, VotingStatus } from "@prisma/client";
import { createMatchRequest, DuelPlayerRequest } from "@repo/logger";
import {
  transformAddMatchRequestToMatchPlayer,
  transformAddMatchRequestToService,
  transformDashboardMatchesToResponse,
  transformMatchesToMatchesResponse,
  transformMatchServiceToResponse,
} from "../utils/utils";
import { TeamRepo } from "../repositories/team-repo";
import { DashboardPlayerRepo } from "../repositories/dashboard-player-repo";
import { DashboardRepo } from "../repositories/dashboard-repo";
import { CompetitionRepo } from "../repositories/competition-repo";
import { EmailService } from "../services/email-service";
import { MatchTeamRepo } from "../repositories/match-team-repo";
import prisma from "../repositories/prisma-client";

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

    const competitionId = req.query.competitionId?.toString();

    console.log("competitionId", competitionId);

    const dashboardId = await UserRepo.getDashboardIdFromUserId(userId);
    if (!dashboardId) {
      return res.status(400).send("No dashboard for the given userId");
    }

    const page = parseInt(req.query.page?.toString() || "1", 10);
    const limit = parseInt(req.query.limit?.toString() || "8", 10);

    const offset = (page - 1) * limit;

    const matches = await MatchRepo.getMatchesWithStats(
      dashboardId,
      competitionId,
      limit,
      offset
    );

    const totalPages = Math.ceil(matches.length / limit);

    res.setHeader("X-Total-Count", matches.length.toString());
    res.setHeader("X-Total-Pages", totalPages.toString());

    const response = transformMatchesToMatchesResponse(matches);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const createMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data: createMatchRequest = req.body;

    const [hometeamID, awayteamID, dashboardId] = await Promise.all([
      TeamRepo.getTeamIDFromName(data.teams[0]),
      TeamRepo.getTeamIDFromName(data.teams[1]),
      DashboardRepo.getDashboardIdFromCompetitionId(data.competitionId),
    ]);

    const matchToAdd = transformAddMatchRequestToService(data);

    const result = await prisma.$transaction(async (tx) => {
      const match = await MatchRepo.createMatch(matchToAdd, tx);

      const playerNicknames = data.players.map((player) => player.nickname);
      await DashboardPlayerRepo.addMissingUsers(
        playerNicknames,
        dashboardId,
        tx
      );

      const matchTeamsData = [
        {
          match_id: match.id,
          team_id: hometeamID,
          is_home: true,
          created_at: new Date(),
        },
        {
          match_id: match.id,
          team_id: awayteamID,
          is_home: false,
          created_at: new Date(),
        },
      ];

      await MatchTeamRepo.createMatchTeams(matchTeamsData, tx);

      const dashboardPlayers =
        await DashboardPlayerRepo.getDashboardPlayersByNicknames(
          playerNicknames,
          dashboardId,
          tx
        );

      const playerMap = new Map(
        dashboardPlayers.map((player) => [player.nickname, player])
      );

      const matchPlayersData = data.players.map((player) => {
        const dashboardPlayer = playerMap.get(player.nickname);

        if (!dashboardPlayer) {
          throw new Error(`Player not found for nickname: ${player.nickname}`);
        }

        return transformAddMatchRequestToMatchPlayer(
          player,
          match.id,
          dashboardPlayer.id,
          player.isHome ? hometeamID : awayteamID
        );
      });

      await MatchPlayerRepo.createMatchPlayers(matchPlayersData, tx);

      const competition = await CompetitionRepo.getCompetitionById(
        match.competition_id,
        tx
      );

      if (competition?.voting_enabled) {
        const votingDays = competition.voting_period_days ?? 7;
        const votingEndDate = new Date();
        votingEndDate.setDate(votingEndDate.getDate() + votingDays);

        await MatchRepo.updateMatchVotingStatus(
          match.id,
          VotingStatus.OPEN,
          votingEndDate,
          tx
        );

        const matchDetails = {
          competitionName: competition.name,
          competitionVotingDays: votingDays,
          date: match.date,
          homeTeam: data.teams[0],
          awayTeam: data.teams[1],
          homeScore: match.home_team_score,
          awayScore: match.away_team_score,
        };

        return { match, matchDetails, dashboardPlayers };
      }

      return { match, matchDetails: null, dashboardPlayers: null };
    });

    if (result.matchDetails && result.dashboardPlayers) {
      setImmediate(async () => {
        try {
          const playersWithEmails = result.dashboardPlayers.filter(
            (player): player is typeof player & { user: { email: string } } =>
              Boolean(player.user?.email)
          );

          const emailPromises = playersWithEmails.map((player) =>
            EmailService.sendVotingInvitation(
              player.user.email,
              player.nickname,
              result.match.id,
              player.id,
              result.matchDetails!
            )
          );

          await Promise.all(emailPromises);
        } catch (emailError) {}
      });
    }

    res.status(201).json(result.match);
  } catch (error) {
    next(error);
  }
};

export const updateMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const matchId = req.params.id;
    const data: createMatchRequest = req.body;

    const [hometeamID, awayteamID, dashboardId] = await Promise.all([
      TeamRepo.getTeamIDFromName(data.teams[0]),
      TeamRepo.getTeamIDFromName(data.teams[1]),
      DashboardRepo.getDashboardIdFromCompetitionId(data.competitionId),
    ]);

    const matchToUpdate: Partial<Match> = {
      date: new Date(data.date),
      home_team_score: data.homeTeamScore,
      away_team_score: data.awayTeamScore,
    };

    const updatedMatch = await prisma.$transaction(async (tx) => {
      const match = await MatchRepo.updateMatch(matchId, matchToUpdate, tx);

      const playerNicknames = data.players.map((player) => player.nickname);
      await DashboardPlayerRepo.addMissingUsers(
        playerNicknames,
        dashboardId,
        tx
      );

      const dashboardPlayers =
        await DashboardPlayerRepo.getDashboardPlayersByNicknames(
          playerNicknames,
          dashboardId,
          tx
        );

      const playerMap = new Map(
        dashboardPlayers.map((player) => [player.nickname, player])
      );

      await MatchPlayerRepo.deleteMatchPlayersFromMatch(matchId, tx);

      const matchPlayersData = data.players.map((player) => {
        const dashboardPlayer = playerMap.get(player.nickname);

        if (!dashboardPlayer) {
          throw new Error(`Player not found for nickname: ${player.nickname}`);
        }

        return transformAddMatchRequestToMatchPlayer(
          player,
          matchId,
          dashboardPlayer.id,
          player.isHome ? hometeamID : awayteamID
        );
      });

      await MatchPlayerRepo.createMatchPlayers(matchPlayersData, tx);

      await DashboardPlayerRepo.deleteDashboardPlayersWithNoMatches(tx);

      return match;
    });

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
