import { MatchWithDetails } from "../repositories/match-repo";
import { LeaguePlayerTotals, MatchResponse, PlayerTotals } from "@repo/logger";
import { PlayerVote } from "@prisma/client";
import { config } from "../config/config";
import { VotingStatus } from "@prisma/client";

export function calculatePlayerScore(
  received_votes: PlayerVote[],
  match_votes: PlayerVote[]
) {
  if (received_votes.length > 0 && match_votes.length > 0) {
    const votePointsSum = received_votes.reduce(
      (sum, vote) => sum + vote.points,
      0
    );

    const score =
      (votePointsSum / match_votes.length) * config.votes.maxVotesPerPlayer;

    return Math.round(score * 100) / 100;
  }

  return 0;
}

export function calculatePlayerStats(matches: MatchResponse[]): PlayerTotals[] {
  const playerMap = new Map<string, PlayerTotals>();

  matches.forEach((match) => {
    match.players.forEach((player) => {
      const existingPlayer = playerMap.get(player.nickname) || {
        id: player.id,
        nickname: player.nickname,
        matches: 0,
        goals: 0,
        assists: 0,
        penalty_scored: 0,
        rating: 0,
      };

      const updatedPlayer = {
        ...existingPlayer,
        matches: existingPlayer.matches + 1,
        goals: existingPlayer.goals + player.goals,
        assists: existingPlayer.assists + player.assists,
        penalty_scored:
          (existingPlayer.penalty_scored || 0) +
          (player.penalty_scored ? 1 : 0),
        rating: (existingPlayer.rating || 0) + (player.rating || 0),
      };

      playerMap.set(player.nickname, updatedPlayer);
    });
  });

  const playerStats = Array.from(playerMap.values()).map((player) => ({
    ...player,
    rating:
      player.matches > 0
        ? Math.round((player.rating! / player.matches) * 100) / 100
        : undefined,
  }));

  return playerStats;
}

export function calculateLeaguePlayerStats(
  matches: MatchResponse[]
): LeaguePlayerTotals[] {
  const playerMap = new Map<string, LeaguePlayerTotals>();

  matches.forEach((match) => {
    match.players.forEach((player) => {
      const existingPlayer = playerMap.get(player.nickname) || {
        id: player.id,
        nickname: player.nickname,
        matches: 0,
        goals: 0,
        assists: 0,
        penalty_scored: 0,
        rating: 0,
        teamName: match.teams[player.isHome ? 0 : 1],
      };

      const updatedPlayer = {
        ...existingPlayer,
        matches: existingPlayer.matches + 1,
        goals: existingPlayer.goals + player.goals,
        assists: existingPlayer.assists + player.assists,
        penalty_scored:
          (existingPlayer.penalty_scored || 0) +
          (player.penalty_scored ? 1 : 0),
        rating: (existingPlayer.rating || 0) + (player.rating || 0),
      };

      playerMap.set(player.nickname, updatedPlayer);
    });
  });

  const playerStats = Array.from(playerMap.values()).map((player) => ({
    ...player,
    rating:
      player.matches > 0
        ? Math.round((player.rating! / player.matches) * 100) / 100
        : undefined,
  }));

  return playerStats;
}

export function calculatePendingVotes(match: MatchWithDetails): number {
  if (
    match.voting_status !== VotingStatus.OPEN ||
    match.competition.voting_enabled === false
  )
    return 0;

  const playerIds = match.matchPlayers.map(
    (player) => player.dashboard_player_id
  );
  const votedPlayerIds = new Set(
    match.player_votes.map((vote) => vote.voter_id)
  );

  return playerIds.filter((id) => !votedPlayerIds.has(id)).length;
}
