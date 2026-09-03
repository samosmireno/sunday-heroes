import {
  CompetitionInfo,
  CompetitionResponse,
  CompetitionSettings,
  CompetitionWithTeams,
  CurrentSeasonResponse,
  MatchResponse,
  PlayerTotals,
  Role,
  SeasonResponse,
} from "@repo/shared-types";
import {
  CompetitionWithDetails,
  CompetitionWithInfo,
  CompetitionWithSettings,
  CompetitionWithTeamCompetitions,
} from "../repositories/competition/types";
import { Competition } from "@prisma/client";
import { calculatePlayerScore, calculatePlayerStats } from "./utils";
import { CreateCompetitionInput } from "../schemas/create-competition-request-schema";

/** What a competition read must carry to place the user: the admin and the moderators. */
interface CompetitionWithRoles {
  dashboard: { adminId: string };
  moderators: { dashboardPlayer: { userId: string | null } }[];
}

/** PLAYER when there is no user, the rule every competition read shares. */
export function getUserRole(
  competition: CompetitionWithRoles,
  userId?: string
): Role {
  if (competition.dashboard.adminId === userId) {
    return Role.ADMIN;
  }

  const moderator = competition.moderators.find(
    (mod) => mod.dashboardPlayer.userId === userId
  );

  if (moderator) {
    return Role.MODERATOR;
  }

  return Role.PLAYER;
}

export function transformCompetitionToResponse(
  competition: CompetitionWithDetails,
  userId?: string
): CompetitionResponse {
  const matches: MatchResponse[] = competition.matches.map((match) => {
    return {
      id: match.id,
      date: match.date?.toLocaleDateString(),
      matchType: match.matchType as MatchResponse["matchType"],
      round: match.round,
      homeTeamScore: match.homeTeamScore,
      awayTeamScore: match.awayTeamScore,
      penaltyHomeScore: match.penaltyHomeScore ?? undefined,
      penaltyAwayScore: match.penaltyAwayScore ?? undefined,
      teams: match.matchTeams.map((matchTeam) => matchTeam.team.name),
      isCompleted: match.isCompleted,
      players: match.matchPlayers.map((player) => {
        return {
          id: player.id,
          nickname: player.dashboardPlayer.nickname,
          isHome: player.isHome,
          goals: player.goals,
          assists: player.assists,
          position: player.position,
          penaltyScored: player.penaltyScored ?? undefined,
          rating:
            player.rating ??
            calculatePlayerScore(player.receivedVotes, match.playerVotes),
          manOfTheMatch: player.isMotm,
        };
      }),
      videoUrl: match.videoUrl ?? undefined,
    };
  });

  const playerStats: PlayerTotals[] = calculatePlayerStats(matches);

  return {
    id: competition.id,
    name: competition.name,
    type: competition.type as CompetitionResponse["type"],
    userRole: getUserRole(competition, userId),
    votingEnabled: competition.votingEnabled,
    matches: matches,
    playerStats: playerStats,
  };
}

export function transformCompetitionToInfoResponse(
  competition: CompetitionWithInfo,
  seasons: SeasonResponse[],
  userId?: string
): CompetitionInfo {
  return {
    id: competition.id,
    name: competition.name,
    type: competition.type as CompetitionResponse["type"],
    votingEnabled: competition.votingEnabled,
    userRole: getUserRole(competition, userId),
    seasons,
  };
}

export function transformCompetitionToSettingsResponse(
  competition: CompetitionWithSettings,
  userId: string,
  currentSeason: CurrentSeasonResponse,
  seasons: SeasonResponse[]
): CompetitionSettings {
  return {
    id: competition.id,
    name: competition.name,
    type: competition.type as CompetitionResponse["type"],
    userRole: getUserRole(competition, userId),
    votingEnabled: competition.votingEnabled,
    moderators: competition.moderators.map((moderator) => ({
      id: moderator.id,
      nickname: moderator.dashboardPlayer.nickname,
    })),
    currentSeason,
    seasons,
  };
}

export function transformCompetitionToTeamsResponse(
  competition: CompetitionWithTeamCompetitions
): CompetitionWithTeams {
  return {
    id: competition.id,
    name: competition.name,
    type: competition.type as CompetitionResponse["type"],
    votingEnabled: competition.votingEnabled,
    teams: competition.teamCompetitions.map((tc) => ({
      id: tc.team.id,
      name: tc.team.name,
    })),
  };
}

export function transformAddCompetitionRequestToService(
  competitionReq: CreateCompetitionInput,
  dashboardId: string
): Omit<Competition, "id"> {
  const competition: Omit<Competition, "id"> = {
    dashboardId,
    name: competitionReq.name,
    type: competitionReq.type,
    createdAt: new Date(Date.now()),
    votingEnabled: competitionReq.votingEnabled,
    votingPeriodDays: competitionReq.votingPeriodDays ?? null,
    knockoutVotingPeriodDays: competitionReq.knockoutVotingPeriodDays ?? null,
    reminderDays: competitionReq.reminderDays ?? null,
    minPlayers: competitionReq.minPlayers ?? 4,
    // A League's round-robin choice is remembered for later seasons.
    isRoundRobin: competitionReq.isRoundRobin ?? null,
  };

  return competition;
}
