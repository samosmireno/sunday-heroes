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

export const createMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data: createMatchRequest = req.body;

    // Get all required IDs in parallel
    const [hometeamID, awayteamID, dashboardId] = await Promise.all([
      TeamRepo.getTeamIDFromName(data.teams[0]),
      TeamRepo.getTeamIDFromName(data.teams[1]),
      DashboardRepo.getDashboardIdFromCompetitionId(data.competitionId),
    ]);

    // Prepare match data
    const matchToAdd = transformAddMatchRequestToService(data);

    // Using a transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create match
      const match = await MatchRepo.createMatch(matchToAdd, tx);

      // 2. Add missing dashboard players
      const playerNicknames = data.players.map((player) => player.nickname);
      await DashboardPlayerRepo.addMissingUsers(
        playerNicknames,
        dashboardId,
        tx
      );

      // 3. Create match teams
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

      // 4. Get all dashboard players in a single query
      const dashboardPlayers =
        await DashboardPlayerRepo.getDashboardPlayersByNicknames(
          playerNicknames,
          dashboardId,
          tx
        );

      // Create a map for quick lookup
      const playerMap = new Map(
        dashboardPlayers.map((player) => [player.nickname, player])
      );

      // 5. Create match players
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

      // 6. Handle voting if enabled
      const competition = await CompetitionRepo.getCompetitionById(
        match.competition_id,
        tx
      );

      if (competition?.voting_enabled) {
        // Set voting end date
        const votingDays = competition.voting_period_days ?? 7;
        const votingEndDate = new Date();
        votingEndDate.setDate(votingEndDate.getDate() + votingDays);

        await MatchRepo.updateMatchVotingStatus(
          match.id,
          VotingStatus.OPEN,
          votingEndDate,
          tx
        );

        // Prepare match details for emails
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

    // Send emails outside of transaction (can be time-consuming)
    if (result.matchDetails && result.dashboardPlayers) {
      // Send emails in background to not block the response
      setImmediate(async () => {
        try {
          // First filter out players without valid email data
          const playersWithEmails = result.dashboardPlayers.filter(
            (player): player is typeof player & { user: { email: string } } =>
              Boolean(player.user?.email)
          );

          // Now map the filtered players to email promises
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
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const matchId = req.params.id;
    const data: createMatchRequest = req.body;

    // Get all required IDs in parallel
    const [hometeamID, awayteamID, dashboardId] = await Promise.all([
      TeamRepo.getTeamIDFromName(data.teams[0]),
      TeamRepo.getTeamIDFromName(data.teams[1]),
      DashboardRepo.getDashboardIdFromCompetitionId(data.competitionId),
    ]);

    // Prepare match data to update
    const matchToUpdate: Partial<Match> = {
      date: new Date(data.date),
      home_team_score: data.homeTeamScore,
      away_team_score: data.awayTeamScore,
    };

    // Use a transaction for all database operations
    const updatedMatch = await prisma.$transaction(async (tx) => {
      // 1. Update the match
      const match = await MatchRepo.updateMatch(matchId, matchToUpdate, tx);

      // 2. Add any new players to the dashboard
      const playerNicknames = data.players.map((player) => player.nickname);
      await DashboardPlayerRepo.addMissingUsers(
        playerNicknames,
        dashboardId,
        tx
      );

      // 3. Get all dashboard players in a single query
      const dashboardPlayers =
        await DashboardPlayerRepo.getDashboardPlayersByNicknames(
          playerNicknames,
          dashboardId,
          tx
        );

      // Create a map for quick lookup
      const playerMap = new Map(
        dashboardPlayers.map((player) => [player.nickname, player])
      );

      // 4. Delete existing match players
      await MatchPlayerRepo.deleteMatchPlayersFromMatch(matchId, tx);

      // 5. Create new match players in bulk
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

      // Bulk insert new match players
      await MatchPlayerRepo.createMatchPlayers(matchPlayersData, tx);

      // 6. Clean up any orphaned dashboard players
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
