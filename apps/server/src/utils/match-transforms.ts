import {
  CompetitionResponse,
  createMatchRequest,
  MatchPageResponse,
  MatchResponse,
  PlayerResponse,
} from "@repo/logger";
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
    nickname: player.dashboard_player.nickname,
    isHome: player.is_home,
    goals: player.goals,
    assists: player.assists,
    position: player.position,
    rating: calculatePlayerScore(player.received_votes, match.player_votes),
  }));

  const sortedPlayers = sortPlayersHomeAwayByPosition(mappedPlayers);

  const transformedData: MatchResponse = {
    id: match.id,
    date: match.date?.toLocaleDateString(),
    match_type: match.match_type as MatchResponse["match_type"],
    round: match.round,
    home_team_score: match.home_team_score,
    away_team_score: match.away_team_score,
    penalty_home_score: match.penalty_home_score ?? undefined,
    penalty_away_score: match.penalty_away_score ?? undefined,
    teams: match.match_teams.map((matchTeam) => matchTeam.team.name),
    players: sortedPlayers,
    is_completed: match.is_completed,
  };

  return transformedData;
}

export function transformMatchesToMatchesResponse(
  userId: string,
  matches: MatchWithDetails[]
): MatchPageResponse[] {
  return matches.map((match) => {
    const homeTeamPlayers: PlayerResponse[] = match.matchPlayers
      .filter((player) => player.is_home)
      .map((player) => ({
        id: player.id,
        nickname: player.dashboard_player.nickname,
        position: player.position,
        goals: player.goals,
        assists: player.assists,
        isHome: player.is_home,
        rating: calculatePlayerScore(player.received_votes, match.player_votes),
      }));

    const awayTeamPlayers: PlayerResponse[] = match.matchPlayers
      .filter((player) => !player.is_home)
      .map((player) => ({
        id: player.id,
        nickname: player.dashboard_player.nickname,
        position: player.position,
        goals: player.goals,
        assists: player.assists,
        isHome: player.is_home,
        rating: calculatePlayerScore(player.received_votes, match.player_votes),
      }));

    const teamNames = match.match_teams.map((teamMatch) => teamMatch.team.name);

    return {
      id: match.id,
      date: match.date?.toLocaleDateString(),
      teams: teamNames,
      scores: [match.home_team_score, match.away_team_score],
      penaltyScores:
        match.penalty_home_score && match.penalty_away_score
          ? [match.penalty_home_score, match.penalty_away_score]
          : undefined,
      matchType: match.match_type as MatchPageResponse["matchType"],
      votingEnabled: match.competition.voting_enabled,
      votingStatus: match.voting_status as MatchPageResponse["votingStatus"],
      votingEndsAt: match.voting_ends_at?.toDateString(),
      playerCount: match.matchPlayers.length,
      pendingVotes: calculatePendingVotes(match),
      playerStats: [...homeTeamPlayers, ...awayTeamPlayers],
      competitionId: match.competition.id,
      competitionName: match.competition.name,
      competitionType: match.competition.type as CompetitionResponse["type"],
      isAdmin: match.competition.dashboard.admin_id === userId,
    };
  });
}

export function transformAddMatchRequestToService(
  match: createMatchRequest,
  competitionVoting?: VotingStatus
): Omit<Match, "id"> {
  const matchForService: Omit<Match, "id"> = {
    competition_id: match.competitionId,
    match_type: match.matchType,
    date: match.date ?? null,
    home_team_score: match.homeTeamScore,
    away_team_score: match.awayTeamScore,
    penalty_home_score: match.penaltyHomeScore ?? null,
    penalty_away_score: match.penaltyHomeScore ?? null,
    created_at: new Date(Date.now()),
    round: match.round,
    bracket_position: match.bracketPosition ?? null,
    voting_status: competitionVoting ? competitionVoting : VotingStatus.CLOSED,
    voting_ends_at: new Date(Date.now() + 5 * 24 * 60 * 60),
    is_completed: true,
  };

  return matchForService;
}
