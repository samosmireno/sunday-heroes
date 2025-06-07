import {
  Competition,
  CompetitionType,
  Prisma,
  VotingStatus,
} from "@prisma/client";
import prisma from "./prisma-client";
import { PrismaTransaction } from "../types";

export type CompetitionWithMatches = Prisma.CompetitionGetPayload<{
  include: {
    matches: true;
    team_competitions: true;
  };
}>;

export type CompetitionWithDetails = Prisma.CompetitionGetPayload<{
  include: {
    dashboard: {
      select: {
        id: true;
        admin_id: true;
      };
    };
    moderators: {
      select: {
        id: true;
        dashboard_player: {
          select: {
            nickname: true;
          };
        };
      };
    };
    team_competitions: true;
    matches: {
      include: {
        matchPlayers: {
          include: {
            dashboard_player: true;
            received_votes: true;
          };
        };
        match_teams: {
          include: {
            team: true;
          };
        };
        player_votes: true;
      };
    };
  };
}>;

export type CompetitionWithPendingVotes = Prisma.CompetitionGetPayload<{
  select: {
    id: true;
    name: true;
    matches: {
      select: {
        id: true;
        date: true;
        home_team_score: true;
        away_team_score: true;
        penalty_home_score: true;
        penalty_away_score: true;
        match_teams: {
          select: {
            team: {
              select: {
                name: true;
              };
            };
          };
        };
        matchPlayers: {
          select: {
            dashboard_player_id: true;
            dashboard_player: {
              select: {
                nickname: true;
                votes_given: {
                  select: {
                    match_id: true;
                  };
                };
              };
            };
          };
        };
      };
    };
  };
}>;

export class CompetitionRepo {
  static async getAllCompetitionsFromDashboard(
    dashboard_id: string
  ): Promise<CompetitionWithMatches[]> {
    return prisma.competition.findMany({
      where: {
        dashboard_id,
      },
      include: {
        matches: true,
        team_competitions: true,
      },
      orderBy: {
        matches: {
          _count: "desc",
        },
      },
    });
  }

  static async getAllDetailedCompetitionsFromDashboard(
    dashboard_id: string,
    user_id: string,
    page: number,
    limit: number,
    type?: CompetitionType,
    search?: string
  ): Promise<CompetitionWithDetails[]> {
    return prisma.competition.findMany({
      where: {
        OR: [
          {
            dashboard_id,
          },
          {
            matches: {
              some: {
                matchPlayers: {
                  some: {
                    dashboard_player: {
                      user_id,
                    },
                  },
                },
              },
            },
          },
        ],
        type: type,
        name: {
          startsWith: search,
          mode: "insensitive",
        },
      },
      skip: page * limit,
      take: limit,
      orderBy: {
        created_at: "desc",
      },
      include: {
        dashboard: {
          select: {
            id: true,
            admin_id: true,
          },
        },
        moderators: {
          select: {
            id: true,
            dashboard_player: {
              select: {
                nickname: true,
              },
            },
          },
        },
        team_competitions: true,
        matches: {
          include: {
            matchPlayers: {
              include: {
                dashboard_player: true,
                received_votes: true,
              },
            },
            match_teams: {
              include: {
                team: true,
              },
            },
            player_votes: true,
          },
        },
      },
    });
  }

  static async getNumCompetitionsFromQuery(
    dashboard_id: string,
    user_id?: string,
    type?: CompetitionType,
    search?: string
  ): Promise<number> {
    const competitions = await prisma.competition.findMany({
      where: {
        OR: [
          {
            dashboard_id,
          },
          {
            matches: {
              some: {
                matchPlayers: {
                  some: {
                    dashboard_player: {
                      user_id,
                    },
                  },
                },
              },
            },
          },
        ],
        type: type,
        name: {
          startsWith: search,
          mode: "insensitive",
        },
      },
    });

    return competitions.length;
  }

  static async getCompetitionById(
    competition_id: string,
    tx?: PrismaTransaction
  ): Promise<CompetitionWithDetails | null> {
    const prismaClient = tx || prisma;
    return prismaClient.competition.findUnique({
      where: {
        id: competition_id,
      },
      include: {
        dashboard: {
          select: {
            id: true,
            admin_id: true,
          },
        },
        moderators: {
          select: {
            id: true,
            dashboard_player: {
              select: {
                nickname: true,
              },
            },
          },
        },
        team_competitions: true,
        matches: {
          include: {
            matchPlayers: {
              include: {
                dashboard_player: true,
                received_votes: true,
              },
            },
            match_teams: {
              include: {
                team: true,
              },
            },
            player_votes: true,
          },
        },
      },
    });
  }

  static async getCompetitionType(
    competition_id: string
  ): Promise<CompetitionType | undefined> {
    const competition = await prisma.competition.findUnique({
      where: { id: competition_id },
    });

    return competition?.type;
  }

  static async getCompetitionVotingStatus(
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

  static async createCompetition(
    data: Omit<Competition, "id">
  ): Promise<Competition> {
    return prisma.competition.create({ data });
  }

  static async getCompetitionWithPendingVotes(
    competition_id: string
  ): Promise<CompetitionWithPendingVotes | null> {
    const competition = await prisma.competition.findUnique({
      where: {
        id: competition_id,
        voting_enabled: true,
      },
      select: {
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
      },
    });

    if (!competition) return null;

    return competition;
  }

  static async resetCompetition(
    competition_id: string,
    tx?: PrismaTransaction
  ): Promise<CompetitionWithDetails> {
    const prismaClient = tx || prisma;
    const competition = await prismaClient.competition.update({
      where: {
        id: competition_id,
      },
      data: {
        matches: {
          deleteMany: {},
        },
        team_competitions: {
          deleteMany: {},
        },
      },
      include: {
        dashboard: {
          select: {
            id: true,
            admin_id: true,
          },
        },
        moderators: {
          select: {
            id: true,
            dashboard_player: {
              select: {
                nickname: true,
              },
            },
          },
        },
        team_competitions: true,
        matches: {
          include: {
            matchPlayers: {
              include: {
                dashboard_player: true,
                received_votes: true,
              },
            },
            match_teams: {
              include: {
                team: true,
              },
            },
            player_votes: true,
          },
        },
      },
    });

    return competition;
  }

  static async deleteCompetition(
    competition_id: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    const prismaClient = tx || prisma;
    await prismaClient.competition.delete({
      where: {
        id: competition_id,
      },
    });
  }
}
