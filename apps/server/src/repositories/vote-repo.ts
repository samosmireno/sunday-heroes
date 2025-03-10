import { Prisma } from "@prisma/client";
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
        email: true;
      };
    };
    player_match: {
      select: {
        id: true;
        player: {
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
            email: true,
          },
        },
        player_match: {
          select: {
            id: true,
            player: {
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
}
