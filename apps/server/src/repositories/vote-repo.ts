import { PlayerVote, Prisma } from "@prisma/client";
import prisma from "./prisma-client";

export type DashboardVoteService = Prisma.PlayerVoteGetPayload<{
  include: {
    match: {
      select: {
        id: true;
        home_team_score: true;
        away_team_score: true;
        competition: {
          select: {
            id: true;
            name: true;
            type: true;
          };
        };
      };
    };
    voter: {
      select: {
        id: true;
        nickname: true;
      };
    };
    player_match: {
      select: {
        id: true;
        dashboard_player: {
          select: {
            id: true;
            nickname: true;
          };
        };
        team: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;

export class VoteRepo {
  static async getAllVotesFromDashboard(dashboard_id: string) {
    const competitions = await prisma.competition.findMany({
      where: {
        dashboard_id,
      },
    });

    const compIDs = competitions.map((comp) => comp.id);

    const matches = await prisma.match.findMany({
      where: {
        competition_id: {
          in: compIDs,
        },
      },
    });

    const matchIDs = matches.map((match) => match.id);

    const votes = await prisma.playerVote.findMany({
      where: {
        match_id: {
          in: matchIDs,
        },
      },
      include: {
        match: {
          select: {
            id: true,
            home_team_score: true,
            away_team_score: true,
            competition: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
        voter: {
          select: {
            id: true,
            nickname: true,
          },
        },
        player_match: {
          select: {
            id: true,
            dashboard_player: {
              select: {
                id: true,
                nickname: true,
              },
            },
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return votes;
  }

  static async createVotes(
    matchId: string,
    voterId: string,
    votes: { playerId: string; points: number }[]
  ) {
    return await prisma.$transaction(
      votes.map((vote) =>
        prisma.playerVote.create({
          data: {
            match_id: matchId,
            voter_id: voterId,
            match_player_id: vote.playerId,
            points: vote.points,
            created_at: new Date(),
          },
        })
      )
    );
  }

  static async getVotesByVoterAndMatch(
    voterId: string,
    matchId: string
  ): Promise<PlayerVote[]> {
    return await prisma.playerVote.findMany({
      where: {
        voter_id: voterId,
        match_id: matchId,
      },
    });
  }

  static async hasPlayerVoted(
    playerId: string,
    matchId: string
  ): Promise<boolean> {
    const count = await prisma.playerVote.count({
      where: {
        voter_id: playerId,
        match_id: matchId,
      },
    });

    return count > 0;
  }

  static async getPendingVoters(matchId: string): Promise<string[]> {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        matchPlayers: {
          select: {
            dashboard_player_id: true,
          },
        },
      },
    });

    if (!match) return [];

    const allPlayerIds = match.matchPlayers.map((mp) => mp.dashboard_player_id);

    const votedPlayerIds = await prisma.playerVote.findMany({
      where: {
        match_id: matchId,
      },
      select: {
        voter_id: true,
      },
      distinct: ["voter_id"],
    });

    const votedIds = votedPlayerIds.map((v) => v.voter_id);

    return allPlayerIds.filter((id) => !votedIds.includes(id));
  }
}
