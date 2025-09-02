import {
  CompetitionResponse,
  createMatchRequest,
  MatchPageResponse,
  MatchResponse,
  PlayerResponse,
} from "@repo/shared-types";
import { MatchWithDetails } from "../repositories/match-repo";
import { Match, VotingStatus } from "@prisma/client";
import { calculatePendingVotes, calculatePlayerScore } from "./utils";

function sortPlayersHomeAwayByPosition(
  players: PlayerResponse[]
): PlayerResponse[] {
  const homePlayers = players
    .filter((player) => player.isHome === true)
    .sort((a, b) => a.position - b.position);
  const awayPlayers = players
    .filter((player) => player.isHome !== true)
    .sort((a, b) => a.position - b.position);

  return [...homePlayers, ...awayPlayers];
}

export function transformMatchServiceToResponse(
  match: MatchWithDetails
): MatchResponse {
  const mappedPlayers = match.matchPlayers.map((player) => ({
    id: player.id,
    nickname: player.dashboardPlayer.nickname,
    isHome: player.isHome,
    goals: player.goals,
    assists: player.assists,
    position: player.position,
    rating: calculatePlayerScore(player.receivedVotes, match.playerVotes),
  }));

  const sortedPlayers = sortPlayersHomeAwayByPosition(mappedPlayers);

  const transformedData: MatchResponse = {
    id: match.id,
    date: match.date?.toLocaleDateString(),
    matchType: match.matchType as MatchResponse["matchType"],
    round: match.round,
    homeTeamScore: match.homeTeamScore,
    awayTeamScore: match.awayTeamScore,
    penaltyHomeScore: match.penaltyHomeScore ?? undefined,
    penaltyAwayScore: match.penaltyAwayScore ?? undefined,
    teams: match.matchTeams.map((matchTeam) => matchTeam.team.name),
    players: sortedPlayers,
    isCompleted: match.isCompleted,
  };

  return transformedData;
}

export function transformMatchesToMatchesResponse(
  userId: string,
  matches: MatchWithDetails[]
): MatchPageResponse[] {
  return matches.map((match) => {
    const homeTeamPlayers: PlayerResponse[] = match.matchPlayers
      .filter((player) => player.isHome)
      .map((player) => ({
        id: player.id,
        nickname: player.dashboardPlayer.nickname,
        position: player.position,
        goals: player.goals,
        assists: player.assists,
        isHome: player.isHome,
        rating: calculatePlayerScore(player.receivedVotes, match.playerVotes),
      }));

    const awayTeamPlayers: PlayerResponse[] = match.matchPlayers
      .filter((player) => !player.isHome)
      .map((player) => ({
        id: player.id,
        nickname: player.dashboardPlayer.nickname,
        position: player.position,
        goals: player.goals,
        assists: player.assists,
        isHome: player.isHome,
        rating: calculatePlayerScore(player.receivedVotes, match.playerVotes),
      }));

    const teamNames = match.matchTeams.map((teamMatch) => teamMatch.team.name);

    return {
      id: match.id,
      date: match.date?.toLocaleDateString(),
      teams: teamNames,
      scores: [match.homeTeamScore, match.awayTeamScore],
      penaltyScores:
        match.penaltyHomeScore && match.penaltyAwayScore
          ? [match.penaltyHomeScore, match.penaltyAwayScore]
          : undefined,
      matchType: match.matchType as MatchPageResponse["matchType"],
      votingEnabled: match.competition.votingEnabled,
      votingStatus: match.votingStatus as MatchPageResponse["votingStatus"],
      votingEndsAt: match.votingEndsAt?.toDateString(),
      playerCount: match.matchPlayers.length,
      pendingVotes: calculatePendingVotes(match),
      playerStats: [...homeTeamPlayers, ...awayTeamPlayers],
      competitionId: match.competition.id,
      competitionName: match.competition.name,
      competitionType: match.competition.type as CompetitionResponse["type"],
      isAdmin: match.competition.dashboard.adminId === userId,
    };
  });
}

export function transformAddMatchRequestToService(
  match: createMatchRequest,
  competitionVoting?: VotingStatus
): Omit<Match, "id"> {
  const matchForService: Omit<Match, "id"> = {
    competitionId: match.competitionId,
    matchType: match.matchType,
    date: match.date ? new Date(match.date) : null,
    homeTeamScore: match.homeTeamScore,
    awayTeamScore: match.awayTeamScore,
    penaltyHomeScore: match.penaltyHomeScore ?? null,
    penaltyAwayScore: match.penaltyHomeScore ?? null,
    createdAt: new Date(Date.now()),
    round: match.round,
    bracketPosition: match.bracketPosition ?? null,
    votingStatus: competitionVoting ? competitionVoting : VotingStatus.CLOSED,
    votingEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60),
    isCompleted: true,
  };

  return matchForService;
}
