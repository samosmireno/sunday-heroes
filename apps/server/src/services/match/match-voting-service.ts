import { Match, Prisma, VotingStatus } from "@prisma/client";
import { createMatchRequest } from "../../schemas/create-match-request-schema";
import { MatchRepo } from "../../repositories/match-repo";
import { CompetitionRepo } from "../../repositories/competition/competition-repo";
import { EmailService } from "../email-service";
import { DashboardPlayerBasic } from "../../repositories/dashboard-player-repo";
import { AppError } from "../../utils/errors";

interface MatchVotingEmailData {
  competitionName: string;
  competitionVotingDays: number;
  reminderDays: number;
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
    dashboardPlayers: DashboardPlayerBasic[],
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
    const competition = await CompetitionRepo.findById(match.competitionId);

    if (!competition?.votingEnabled) return null;

    const votingDays = competition.votingPeriodDays ?? 7;
    const reminderDays = competition.reminderDays ?? 3;
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
      reminderDays: reminderDays,
      date: match.date ? new Date(match.date) : new Date(),
      homeTeam: data.teams[0],
      awayTeam: data.teams[1],
      homeScore: match.homeTeamScore,
      awayScore: match.awayTeamScore,
    };
  }

  private static sendVotingEmails(
    matchDetails: MatchVotingEmailData,
    matchId: string,
    dashboardPlayers: DashboardPlayerBasic[]
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

  static async sendReminderEmails() {
    setImmediate(async () => {
      try {
        const matches = await MatchRepo.findMatchesExpiringSoon();

        for (const match of matches) {
          const notVotedPlayers = match.matchPlayers.filter((mp) => {
            const votesGiven = match.playerVotes.filter(
              (v) => v.voterId === mp.dashboardPlayer.id
            );
            return !votesGiven.length && mp.dashboardPlayer.user?.email;
          });

          for (const mp of notVotedPlayers) {
            await EmailService.sendVotingInvitation(
              mp.dashboardPlayer.user!.email,
              mp.dashboardPlayer.nickname,
              match.id,
              mp.dashboardPlayer.id,
              {
                competitionName: match.competition.name,
                competitionVotingDays: match.competition.votingPeriodDays ?? 7,
                reminderDays: match.competition.reminderDays ?? 3,
                date: match.date ?? new Date(),
                homeTeam:
                  match.matchTeams.find((t) => t.isHome)?.team.name ?? "",
                awayTeam:
                  match.matchTeams.find((t) => !t.isHome)?.team.name ?? "",
                homeScore: match.homeTeamScore,
                awayScore: match.awayTeamScore,
              },
              true
            );
          }
        }
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
