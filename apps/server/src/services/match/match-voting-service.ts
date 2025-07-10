import { Match, Prisma, VotingStatus } from "@prisma/client";
import { createMatchRequest } from "@repo/shared-types";
import { MatchRepo } from "../../repositories/match-repo";
import { CompetitionRepo } from "../../repositories/competition/competition-repo";
import { EmailService } from "../email-service";
import { DashboardPlayerWithUserDetails } from "../../repositories/dashboard-player-repo";
import { AppError } from "../../utils/errors";

interface MatchVotingEmailData {
  competitionName: string;
  competitionVotingDays: number;
  date: Date;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

export class MatchVotingService {
  static async closeExpiredVoting(): Promise<void> {
    const expiredMatches = await MatchRepo.findWithExpiredVoting();

    if (expiredMatches.length > 0) {
      const matchIds = expiredMatches.map((m) => m.id);
      await MatchRepo.updateManyVotingStatus(matchIds, "CLOSED");
      console.log(`Closed voting for ${expiredMatches.length} expired matches`);
    }
  }

  static async handleMatchVoting(
    match: Match,
    data: createMatchRequest,
    dashboardPlayers: DashboardPlayerWithUserDetails[],
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const emailData = await this.setupVoting(match, data, tx);

    if (emailData) {
      this.sendVotingEmails(emailData, match.id, dashboardPlayers);
    }
  }

  private static async setupVoting(
    match: Match,
    data: createMatchRequest,
    tx?: Prisma.TransactionClient
  ): Promise<MatchVotingEmailData | null> {
    const competition = await CompetitionRepo.findById(match.competition_id);

    if (!competition?.voting_enabled) return null;

    const votingDays = competition.voting_period_days ?? 7;
    const votingEndDate = new Date();
    votingEndDate.setDate(votingEndDate.getDate() + votingDays);

    await MatchRepo.updateVotingStatus(
      match.id,
      VotingStatus.OPEN,
      votingEndDate,
      tx
    );

    return {
      competitionName: competition.name,
      competitionVotingDays: votingDays,
      date: match.date ? new Date(match.date) : new Date(),
      homeTeam: data.teams[0],
      awayTeam: data.teams[1],
      homeScore: match.home_team_score,
      awayScore: match.away_team_score,
    };
  }

  private static sendVotingEmails(
    matchDetails: MatchVotingEmailData,
    matchId: string,
    dashboardPlayers: DashboardPlayerWithUserDetails[]
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
        throw new AppError(
          "Error sending match voting emails",
          500,
          error instanceof Error ? error.message : "Unknown error",
          true
        );
      }
    });
  }
}
