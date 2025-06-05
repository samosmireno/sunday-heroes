import { Match, VotingStatus } from "@prisma/client";
import { createMatchRequest } from "@repo/logger";
import { MatchRepo } from "../repositories/match-repo";
import { TeamRepo } from "../repositories/team-repo";
import { DashboardRepo } from "../repositories/dashboard-repo";
import { CompetitionRepo } from "../repositories/competition-repo";
import { DashboardPlayerRepo } from "../repositories/dashboard-player-repo";
import { MatchTeamRepo } from "../repositories/match-team-repo";
import { MatchPlayerRepo } from "../repositories/match-player-repo";
import { UserRepo } from "../repositories/user-repo";
import { EmailService } from "./email-service";
import prisma from "../repositories/prisma-client";
import {
  transformAddMatchRequestToService,
  transformMatchServiceToResponse,
  transformMatchesToMatchesResponse,
} from "../utils/match-transforms";
import { transformDashboardMatchesToResponse } from "../utils/dashboard-transforms";
import { transformAddMatchRequestToMatchPlayer } from "../utils/match-player-transforms";

export class MatchService {
  static async getAllMatches() {
    const matches = await MatchRepo.getAllMatchesWithDetails();
    return matches.map(transformMatchServiceToResponse);
  }

  static async getMatchById(id: string) {
    const match = await MatchRepo.getMatchWithPlayersById(id);
    return match ? transformMatchServiceToResponse(match) : null;
  }

  static async getDashboardMatches(userId: string) {
    const dashboardId = await UserRepo.getDashboardIdFromUserId(userId);
    if (!dashboardId) {
      throw new Error("No dashboard for the given userId");
    }

    const matches = await MatchRepo.getAllMatchesFromDashboard(dashboardId);
    return transformDashboardMatchesToResponse(matches);
  }

  static async getCompetitionMatches(competitionId: string) {
    const matches = await MatchRepo.getAllMatchesFromCompetition(competitionId);
    return matches.map(transformMatchServiceToResponse);
  }

  static async getMatchesWithStats(
    userId: string,
    competitionId?: string,
    page = 1,
    limit = 10
  ) {
    const dashboardId = await UserRepo.getDashboardIdFromUserId(userId);
    if (!dashboardId) {
      throw new Error("No dashboard for the given userId");
    }

    const offset = (page - 1) * limit;
    const matches = await MatchRepo.getMatchesWithStats(
      dashboardId,
      userId,
      competitionId,
      limit,
      offset
    );

    return {
      matches: transformMatchesToMatchesResponse(userId, matches),
      totalCount: matches.length,
      totalPages: Math.ceil(matches.length / limit),
    };
  }

  static async createMatch(data: createMatchRequest) {
    const [hometeamID, awayteamID, dashboardId, competitionVoting] =
      await Promise.all([
        TeamRepo.getTeamIDFromName(data.teams[0]),
        TeamRepo.getTeamIDFromName(data.teams[1]),
        DashboardRepo.getDashboardIdFromCompetitionId(data.competitionId),
        CompetitionRepo.getCompetitionVotingStatus(data.competitionId),
      ]);

    const matchToAdd = transformAddMatchRequestToService(
      data,
      competitionVoting
    );

    return await prisma.$transaction(async (tx) => {
      const match = await MatchRepo.createMatch(matchToAdd, tx);

      await this.createMatchTeams(match.id, hometeamID, awayteamID, tx);
      const dashboardPlayers = await this.createMatchPlayers(
        data.players,
        match.id,
        dashboardId,
        hometeamID,
        awayteamID,
        tx
      );

      const emailData = await this.handleVoting(match, data, tx);

      if (emailData) {
        this.sendVotingEmails(emailData, match.id, dashboardPlayers);
      }

      return match;
    });
  }

  static async updateMatch(matchId: string, data: createMatchRequest) {
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

    return await prisma.$transaction(async (tx) => {
      const match = await MatchRepo.updateMatch(matchId, matchToUpdate, tx);

      await MatchPlayerRepo.deleteMatchPlayersFromMatch(matchId, tx);
      await this.createMatchPlayers(
        data.players,
        matchId,
        dashboardId,
        hometeamID,
        awayteamID,
        tx
      );

      await DashboardPlayerRepo.deleteDashboardPlayersWithNoMatches(tx);
      return match;
    });
  }

  static async deleteMatch(matchId: string) {
    return await MatchRepo.deleteMatch(matchId);
  }

  private static async createMatchTeams(
    matchId: string,
    hometeamID: string,
    awayteamID: string,
    tx: any
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

  private static async createMatchPlayers(
    players: any[],
    matchId: string,
    dashboardId: string,
    hometeamID: string,
    awayteamID: string,
    tx: any
  ) {
    const playerNicknames = players.map((p) => p.nickname);

    await DashboardPlayerRepo.addMissingUsers(playerNicknames, dashboardId, tx);

    const dashboardPlayers =
      await DashboardPlayerRepo.getDashboardPlayersByNicknames(
        playerNicknames,
        dashboardId,
        tx
      );

    const playerMap = new Map(dashboardPlayers.map((p) => [p.nickname, p]));

    const matchPlayersData = players.map((player) => {
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
    return dashboardPlayers;
  }

  private static async handleVoting(
    match: any,
    data: createMatchRequest,
    tx: any
  ) {
    const competition = await CompetitionRepo.getCompetitionById(
      match.competition_id,
      tx
    );

    if (!competition?.voting_enabled) return null;

    const votingDays = competition.voting_period_days ?? 7;
    const votingEndDate = new Date();
    votingEndDate.setDate(votingEndDate.getDate() + votingDays);

    await MatchRepo.updateMatchVotingStatus(
      match.id,
      VotingStatus.OPEN,
      votingEndDate,
      tx
    );

    return {
      competitionName: competition.name,
      competitionVotingDays: votingDays,
      date: match.date,
      homeTeam: data.teams[0],
      awayTeam: data.teams[1],
      homeScore: match.home_team_score,
      awayScore: match.away_team_score,
    };
  }

  private static sendVotingEmails(
    matchDetails: any,
    matchId: string,
    dashboardPlayers: any[]
  ) {
    setImmediate(async () => {
      try {
        const playersWithEmails = dashboardPlayers.filter(
          (player): player is typeof player & { user: { email: string } } =>
            Boolean(player.user?.email)
        );

        const emailPromises = playersWithEmails.map((player) =>
          EmailService.sendVotingInvitation(
            player.user.email,
            player.nickname,
            matchId,
            player.id,
            matchDetails
          )
        );

        await Promise.all(emailPromises);
      } catch (error) {
        console.error("Email sending failed:", error);
      }
    });
  }
}
