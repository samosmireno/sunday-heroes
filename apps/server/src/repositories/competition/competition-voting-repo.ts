import { Prisma, VotingStatus } from "@prisma/client";
import prisma from "../prisma-client";
import { PrismaTransaction } from "../../types";

const COMPETITION_PENDING_VOTES_SELECT = {
  id: true,
  name: true,
  matches: {
    where: {
      voting_status: VotingStatus.OPEN,
    },
    select: {
      id: true,
      date: true,
      home_team_score: true,
      away_team_score: true,
      penalty_home_score: true,
      penalty_away_score: true,
      match_teams: {
        select: {
          team: {
            select: {
              name: true,
            },
          },
        },
      },
      matchPlayers: {
        select: {
          dashboard_player_id: true,
          dashboard_player: {
            select: {
              nickname: true,
              votes_given: {
                select: {
                  match_id: true,
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CompetitionSelect;

export type CompetitionWithPendingVotes = Prisma.CompetitionGetPayload<{
  select: typeof COMPETITION_PENDING_VOTES_SELECT;
}>;

export class CompetitionVotingRepo {
  static async findByIdWithPendingVotes(
    id: string,
    tx?: PrismaTransaction
  ): Promise<CompetitionWithPendingVotes | null> {
    try {
      const prismaClient = tx || prisma;
      return await prismaClient.competition.findUnique({
        where: {
          id,
          voting_enabled: true,
        },
        select: COMPETITION_PENDING_VOTES_SELECT,
      });
    } catch (error) {
      console.error(
        "Error in CompetitionVotingRepo.findByIdWithPendingVotes:",
        error
      );
      throw new Error("Failed to fetch competition with pending votes");
    }
  }

  static async getVotingSettings(
    id: string,
    tx?: PrismaTransaction
  ): Promise<{
    voting_enabled: boolean;
    voting_period_days: number | null;
  } | null> {
    try {
      const prismaClient = tx || prisma;
      const competition = await prismaClient.competition.findUnique({
        where: { id },
        select: {
          voting_enabled: true,
          voting_period_days: true,
        },
      });
      return competition;
    } catch (error) {
      console.error("Error in CompetitionVotingRepo.getVotingSettings:", error);
      throw new Error("Failed to get voting settings");
    }
  }

  static async getVotingStatus(
    competition_id: string
  ): Promise<VotingStatus | undefined> {
    const competition = await prisma.competition.findUnique({
      where: { id: competition_id },
      select: {
        voting_enabled: true,
      },
    });
    return competition?.voting_enabled
      ? VotingStatus.OPEN
      : VotingStatus.CLOSED;
  }
}
