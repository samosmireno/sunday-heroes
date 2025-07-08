import { CompetitionType, Match, Prisma } from "@prisma/client";
import { createMatchRequest } from "@repo/shared-types";
import { MatchRepo } from "../../repositories/match-repo";
import { TeamRepo } from "../../repositories/team-repo";
import { MatchTeamRepo } from "../../repositories/match-team-repo";
import { MatchVotingService } from "./match-voting-service";
import { MatchPlayerService } from "../match-player-service";
import prisma from "../../repositories/prisma-client";
import { transformAddMatchRequestToService } from "../../utils/match-transforms";
import { CompetitionVotingRepo } from "../../repositories/competition/competition-voting-repo";
import { DashboardService } from "../dashboard-service";
import { DashboardPlayerService } from "../dashboard-player-service";
import { MatchService } from "./match-service";
import { LeagueService } from "../league-service";

export class MatchCreationService {
  static async createMatch(data: createMatchRequest) {
    const [hometeamID, awayteamID, dashboardId, competitionVoting] =
      await Promise.all([
        TeamRepo.getTeamIDFromName(data.teams[0], data.competitionId),
        TeamRepo.getTeamIDFromName(data.teams[1], data.competitionId),
        DashboardService.getDashboardIdFromCompetitionId(data.competitionId),
        CompetitionVotingRepo.getVotingStatus(data.competitionId),
      ]);

    const matchToAdd = transformAddMatchRequestToService(
      data,
      competitionVoting
    );

    return await prisma.$transaction(async (tx) => {
      const match = await MatchRepo.create(matchToAdd, tx);

      await this.createMatchTeams(match.id, hometeamID, awayteamID, tx);
      const dashboardPlayers = await MatchPlayerService.createMatchPlayers(
        data.players,
        match.id,
        dashboardId,
        hometeamID,
        awayteamID,
        tx
      );

      await MatchVotingService.handleMatchVoting(
        match,
        data,
        dashboardPlayers,
        tx
      );

      return match;
    });
  }

  static async updateMatch(matchId: string, data: createMatchRequest) {
    const [hometeamID, awayteamID, dashboardId] = await Promise.all([
      TeamRepo.getTeamIDFromName(data.teams[0], data.competitionId),
      TeamRepo.getTeamIDFromName(data.teams[1], data.competitionId),
      DashboardService.getDashboardIdFromCompetitionId(data.competitionId),
    ]);

    const matchToUpdate: Partial<Match> = {
      date: data.date ? new Date(data.date) : undefined,
      home_team_score: data.homeTeamScore,
      away_team_score: data.awayTeamScore,
    };

    const competitionType =
      await MatchService.getCompetitionTypeFromMatchId(matchId);

    const match = await MatchRepo.findByIdWithTeams(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    if (
      competitionType === CompetitionType.LEAGUE &&
      match.is_completed === true
    ) {
      await LeagueService.recalculateLeagueStandings(
        match,
        data.homeTeamScore,
        data.awayTeamScore
      );
    }

    return await prisma.$transaction(async (tx) => {
      const match = await MatchRepo.update(matchId, matchToUpdate, tx);

      const dashboardPlayers = await MatchPlayerService.updateMatchPlayers(
        data.players,
        matchId,
        dashboardId,
        hometeamID,
        awayteamID,
        tx
      );

      await DashboardPlayerService.cleanupUnusedPlayers(tx);

      await MatchVotingService.handleMatchVoting(
        match,
        data,
        dashboardPlayers,
        tx
      );

      return match;
    });
  }

  private static async createMatchTeams(
    matchId: string,
    hometeamID: string,
    awayteamID: string,
    tx: Prisma.TransactionClient
  ) {
    const matchTeamsData = [
      {
        match_id: matchId,
        team_id: hometeamID,
        is_home: true,
        created_at: new Date(),
      },
      {
        match_id: matchId,
        team_id: awayteamID,
        is_home: false,
        created_at: new Date(),
      },
    ];

    await MatchTeamRepo.createMatchTeams(matchTeamsData, tx);
  }
}
