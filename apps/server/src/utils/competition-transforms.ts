import {
  CompetitionResponse,
  MatchResponse,
  PlayerTotals,
  Role,
} from "@repo/shared-types";
import { CompetitionWithDetails } from "../repositories/competition/competition-repo";
import { Competition } from "@prisma/client";
import {
  calculatePlayerScore,
  calculatePlayerStats,
  findManOfTheMatchId,
} from "./utils";
import { createCompetitionRequest } from "../schemas/create-competition-request-schema";

export function getUserRole(
  competition: CompetitionWithDetails,
  userId: string
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
  userId: string
): CompetitionResponse {
  const matches: MatchResponse[] = competition.matches.map((match) => ({
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
        rating: calculatePlayerScore(player.receivedVotes, match.playerVotes),
        manOfTheMatch: player.id === findManOfTheMatchId(match),
      };
    }),
    videoUrl: match.videoUrl ?? undefined,
  }));

  const playerStats: PlayerTotals[] = calculatePlayerStats(matches);

  const teams = competition.teamCompetitions.map((teamComp) => ({
    id: teamComp.team.id,
    name: teamComp.team.name,
  }));

  return {
    id: competition.id,
    name: competition.name,
    type: competition.type as CompetitionResponse["type"],
    userRole: getUserRole(competition, userId),
    votingEnabled: competition.votingEnabled,
    teams: teams.length > 0 ? teams : undefined,
    matches: matches,
    playerStats: playerStats,
    moderators: competition.moderators.map((moderator) => ({
      id: moderator.id,
      nickname: moderator.dashboardPlayer.nickname,
    })),
  };
}

export function transformAddCompetitionRequestToService(
  competitionReq: createCompetitionRequest,
  dashboardId: string
): Omit<Competition, "id"> {
  const competition: Omit<Competition, "id"> = {
    dashboardId,
    name: competitionReq.name,
    type: competitionReq.type,
    createdAt: new Date(Date.now()),
    trackSeasons: competitionReq.trackSeasons,
    currentSeason: competitionReq.currentSeason ?? 1,
    votingEnabled: competitionReq.votingEnabled,
    votingPeriodDays: competitionReq.votingPeriodDays ?? null,
    knockoutVotingPeriodDays: competitionReq.knockoutVotingPeriodDays ?? null,
    reminderDays: competitionReq.reminderDays ?? null,
    minPlayers: competitionReq.minPlayers ?? 4,
    isRoundRobin: null,
  };

  return competition;
}
