import { CompetitionType, Match, Prisma } from "@prisma/client";
import { createMatchRequest } from "../../schemas/create-match-request-schema";
import { MatchRepo } from "../../repositories/match/match-repo";
import { TeamRepo } from "../../repositories/team/team-repo";
import { MatchTeamRepo } from "../../repositories/match-team-repo";
import { MatchVotingService } from "./match-voting-service";
import { MatchPlayerService } from "../match-player-service";
import prisma from "../../repositories/prisma-client";
import { transformAddMatchRequestToService } from "../../utils/match-transforms";
import { CompetitionVotingRepo } from "../../repositories/competition/competition-voting-repo";
import { DashboardService } from "../dashboard-service";
import { DashboardPlayerService } from "../dashboard-player-service";
import { LeagueService } from "../league-service";
import { NotFoundError } from "../../utils/errors";
import { SeasonRepo } from "../../repositories/season/season-repo";
import { MatchWithTeams } from "../../repositories/match/types";

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
      // A new Match always lands in the Current season.
      const currentSeason = await SeasonRepo.findCurrent(data.competitionId, tx);
      if (!currentSeason) {
        throw new NotFoundError("Season");
      }

      const match = await MatchRepo.create(
        { ...matchToAdd, seasonId: currentSeason.id },
        tx
      );

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

  /** Writes the edit-match request onto a Match the caller has read and cleared for writing. */
  static async updateMatch(match: MatchWithTeams, data: createMatchRequest) {
    const matchId = match.id;
    const [hometeamID, awayteamID, dashboardId] = await Promise.all([
      TeamRepo.getTeamIDFromName(data.teams[0], data.competitionId),
      TeamRepo.getTeamIDFromName(data.teams[1], data.competitionId),
      DashboardService.getDashboardIdFromCompetitionId(data.competitionId),
    ]);

    const matchToUpdate: Partial<Match> = {
      date: data.date ? new Date(data.date) : undefined,
      homeTeamScore: data.homeTeamScore,
      awayTeamScore: data.awayTeamScore,
      videoUrl: data.videoUrl,
    };

    if (
      match.competition.type === CompetitionType.LEAGUE &&
      match.isCompleted === true
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
    hometeamId: string,
    awayteamId: string,
    tx: Prisma.TransactionClient
  ) {
    const matchTeamsData = [
      {
        matchId: matchId,
        teamId: hometeamId,
        isHome: true,
        createdAt: new Date(),
      },
      {
        matchId: matchId,
        teamId: awayteamId,
        isHome: false,
        createdAt: new Date(),
      },
    ];

    await MatchTeamRepo.createMatchTeams(matchTeamsData, tx);
  }
}
