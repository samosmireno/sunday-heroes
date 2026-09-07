import { MatchWithDetails } from "../repositories/match/types";
import {
  LeaguePlayerTotals,
  MatchResponse,
  PlayerTotals,
} from "@repo/shared-types";
import { PlayerVote } from "@prisma/client";
import { config } from "../config/config";
import { VotingStatus } from "@prisma/client";
import { VotingEligibility } from "./voting-eligibility";

export function calculatePlayerScore(
  received_votes: PlayerVote[],
  match_votes: PlayerVote[],
) {
  if (received_votes.length > 0 && match_votes.length > 0) {
    const votePointsSum = received_votes.reduce(
      (sum, vote) => sum + vote.points,
      0,
    );

    const score =
      (votePointsSum / match_votes.length) * config.votes.maxVotesPerPlayer;

    return Math.round(score * 100) / 100;
  }

  return 0;
}

function determineMatchWinner(match: MatchResponse): "home" | "away" | "draw" {
  // Regular time result
  if (match.homeTeamScore > match.awayTeamScore) {
    return "home";
  }
  if (match.awayTeamScore > match.homeTeamScore) {
    return "away";
  }

  // Check penalties if it's a draw
  if (
    match.penaltyHomeScore !== undefined &&
    match.penaltyAwayScore !== undefined
  ) {
    if (match.penaltyHomeScore > match.penaltyAwayScore) {
      return "home";
    }
    if (match.penaltyAwayScore > match.penaltyHomeScore) {
      return "away";
    }
  }

  return "draw";
}

/** A draw is worth this fraction of a win in a player's win rate. */
export const DRAW_WIN_WEIGHT = 0.3;

/** A player's running totals while their matches are being tallied. */
type PlayerTally<T extends PlayerTotals> = T & {
  draws: number;
  ratedMatches: number;
};

/**
 * A match had votes iff at least one player scored above zero: `calculatePlayerScore`
 * returns exactly 0 for an empty ballot. Works identically on old and new data — a
 * voteless match now stores `null` and the transform recomputes it to 0, a historical
 * one stores 0 directly — so both are excluded from the rating divisor.
 */
function matchWasRated(match: MatchResponse): boolean {
  return match.players.some((player) => player.rating > 0);
}

/** Wins plus weighted draws, as a percentage of matches played, to two decimals. */
export function calculateWinRate(
  wins: number,
  draws: number,
  matches: number,
): number {
  if (matches === 0) return 0;
  const weightedWins = wins + draws * DRAW_WIN_WEIGHT;
  return Number(((weightedWins / matches) * 100).toFixed(2));
}

export function calculatePlayerStats(matches: MatchResponse[]): PlayerTotals[] {
  const playerMap = new Map<string, PlayerTally<PlayerTotals>>();

  matches.forEach((match) => {
    const matchWinner = determineMatchWinner(match);
    const hadVotes = matchWasRated(match);

    match.players.forEach((player) => {
      const existingPlayer = playerMap.get(player.nickname) || {
        id: player.id,
        nickname: player.nickname,
        matches: 0,
        wins: 0,
        draws: 0,
        ratedMatches: 0,
        winRate: 0,
        goals: 0,
        assists: 0,
        penaltyScored: 0,
        rating: 0,
        numManOfTheMatch: 0,
      };

      const hasWon =
        (player.isHome && matchWinner === "home") ||
        (!player.isHome && matchWinner === "away");
      const hasDrawn = matchWinner === "draw";

      const updatedPlayer = {
        ...existingPlayer,
        matches: existingPlayer.matches + 1,
        wins: existingPlayer.wins + (hasWon ? 1 : 0),
        draws: existingPlayer.draws + (hasDrawn ? 1 : 0),
        ratedMatches: existingPlayer.ratedMatches + (hadVotes ? 1 : 0),
        goals: existingPlayer.goals + player.goals,
        assists: existingPlayer.assists + player.assists,
        penaltyScored:
          (existingPlayer.penaltyScored || 0) + (player.penaltyScored ? 1 : 0),
        rating: (existingPlayer.rating || 0) + (player.rating || 0),
        numManOfTheMatch:
          (existingPlayer.numManOfTheMatch || 0) +
          (player.manOfTheMatch ? 1 : 0),
      };

      playerMap.set(player.nickname, updatedPlayer);
    });
  });

  const playerStats = Array.from(playerMap.values()).map(
    ({ draws, ratedMatches, ...player }) => ({
      ...player,
      // Rating averages over the matches that were actually voted on; `matches`
      // and `winRate` still divide by all of them. This is the divisor SQL `AVG`
      // has always used on the dashboard, which skips NULL.
      rating:
        ratedMatches > 0
          ? Math.round((player.rating! / ratedMatches) * 100) / 100
          : undefined,
      winRate: calculateWinRate(player.wins, draws, player.matches),
    }),
  );

  return playerStats;
}

export function calculateLeaguePlayerStats(
  matches: MatchResponse[],
): LeaguePlayerTotals[] {
  const playerMap = new Map<string, PlayerTally<LeaguePlayerTotals>>();

  matches.forEach((match) => {
    const matchWinner = determineMatchWinner(match);
    const hadVotes = matchWasRated(match);
    match.players.forEach((player) => {
      const existingPlayer = playerMap.get(player.nickname) || {
        id: player.id,
        nickname: player.nickname,
        matches: 0,
        wins: 0,
        draws: 0,
        ratedMatches: 0,
        winRate: 0,
        goals: 0,
        assists: 0,
        penaltyScored: 0,
        rating: 0,
        teamName: match.teams[player.isHome ? 0 : 1],
      };

      const hasWon =
        (player.isHome && matchWinner === "home") ||
        (!player.isHome && matchWinner === "away");
      const hasDrawn = matchWinner === "draw";

      const updatedPlayer = {
        ...existingPlayer,
        matches: existingPlayer.matches + 1,
        wins: existingPlayer.wins + (hasWon ? 1 : 0),
        draws: existingPlayer.draws + (hasDrawn ? 1 : 0),
        ratedMatches: existingPlayer.ratedMatches + (hadVotes ? 1 : 0),
        goals: existingPlayer.goals + player.goals,
        assists: existingPlayer.assists + player.assists,
        penaltyScored:
          (existingPlayer.penaltyScored || 0) + (player.penaltyScored ? 1 : 0),
        rating: (existingPlayer.rating || 0) + (player.rating || 0),
      };

      playerMap.set(player.nickname, updatedPlayer);
    });
  });

  const playerStats = Array.from(playerMap.values()).map(
    ({ draws, ratedMatches, ...player }) => ({
      ...player,
      // Rating averages over the matches that were actually voted on; `matches`
      // and `winRate` still divide by all of them. This is the divisor SQL `AVG`
      // has always used on the dashboard, which skips NULL.
      rating:
        ratedMatches > 0
          ? Math.round((player.rating! / ratedMatches) * 100) / 100
          : undefined,
      winRate: calculateWinRate(player.wins, draws, player.matches),
    }),
  );

  return playerStats;
}

/**
 * The ballots this match is still waiting for: participants who have not voted
 * **and whose vote the Voting gate would accept**.
 *
 * This is the closure condition's twin, computed a second time without the
 * write. Unfiltered it advertises votes that can never arrive — "2 votes
 * pending" for two players the gate has shut out, while closure had already
 * judged the electorate complete — and a stranded match (armed mid-voting,
 * every Eligible voter done) would sit at a count that never falls. Filtered,
 * it reads as the truth: voting open, nothing more can arrive, waiting for the
 * deadline.
 *
 * During the runway, and in a Competition with no Voting threshold, `for()`
 * answers `canVote` for everyone and the count is exactly what it was.
 */
export function calculatePendingVotes(
  match: MatchWithDetails,
  eligibility: VotingEligibility,
): number {
  if (
    match.votingStatus !== VotingStatus.OPEN ||
    match.competition.votingEnabled === false
  )
    return 0;

  const votedPlayerIds = new Set(match.playerVotes.map((vote) => vote.voterId));

  return match.matchPlayers.filter(
    (player) =>
      !votedPlayerIds.has(player.dashboardPlayerId) &&
      eligibility.for(player.dashboardPlayerId).canVote,
  ).length;
}
