import { MatchWithDetails, MatchWithTeams } from "../repositories/match-repo";
import { z } from "zod";
import {
  CompetitionResponse,
  createMatchRequest,
  DashboardCompetitionResponse,
  DashboardMatchResponse,
  DashboardResponse,
  DashboardVoteResponse,
  DuelPlayerRequest,
  MatchResponse,
  PlayerResponse,
  PlayerTotals,
  VotingStatus,
  createCompetitionRequest,
  DetailedCompetitionResponse,
  CompetitionVotes,
  PendingVote,
} from "@repo/logger";
import { Competition, Match, MatchPlayer, PlayerVote } from "@prisma/client";
import { DashboardWithDetails } from "../repositories/dashboard-repo";
import {
  CompetitionWithDetails,
  CompetitionWithMatches,
  CompetitionWithPendingVotes,
} from "../repositories/competition-repo";
import { DashboardVoteService } from "../repositories/vote-repo";
import { MatchPlayerWithDetails } from "../repositories/match-player-repo";
import { config } from "../config/config";

export function createStepSchema<T extends Record<string, z.ZodType>>(
  steps: T
) {
  return z.object(steps);
}

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

function calculatePlayerScore(
  received_votes: PlayerVote[],
  match_votes: PlayerVote[]
) {
  if (received_votes.length > 0 && match_votes.length > 0) {
    const votePointsSum = received_votes.reduce(
      (sum, vote) => sum + vote.points,
      0
    );

    return (
      (votePointsSum / match_votes.length) * config.votes.maxVotesPerPlayer
    );
  }

  return 0;
}

export function transformMatchServiceToResponse(
  data: MatchWithDetails
): MatchResponse {
  const mappedPlayers = data.matchPlayers.map((player) => ({
    id: player.id,
    nickname: player.dashboard_player.nickname,
    isHome: player.is_home,
    goals: player.goals,
    assists: player.assists,
    position: player.position,
    rating: calculatePlayerScore(player.received_votes, data.player_votes),
  }));

  const sortedPlayers = sortPlayersHomeAwayByPosition(mappedPlayers);

  const transformedData: MatchResponse = {
    id: data.id,
    date: data.date.toLocaleDateString(),
    match_type: data.match_type as MatchResponse["match_type"],
    round: data.round,
    home_team_score: data.home_team_score,
    away_team_score: data.away_team_score,
    penalty_home_score: data.penalty_home_score ?? undefined,
    penalty_away_score: data.penalty_away_score ?? undefined,
    teams: data.match_teams.map((matchTeam) => matchTeam.team.name),
    players: sortedPlayers,
  };

  return transformedData;
}

export function transformAddMatchRequestToService(
  data: createMatchRequest
): Omit<Match, "id"> {
  const matchForService: Omit<Match, "id"> = {
    competition_id: data.competitionId,
    match_type: data.matchType,
    date: data.date,
    home_team_score: data.homeTeamScore,
    away_team_score: data.awayTeamScore,
    penalty_home_score: data.penaltyHomeScore ?? null,
    penalty_away_score: data.penaltyHomeScore ?? null,
    created_at: new Date(Date.now()),
    round: data.round,
    bracket_position: data.bracketPosition ?? null,
    voting_status: VotingStatus.OPEN,
    voting_ends_at: new Date(Date.now() + 5 * 24 * 60 * 60),
    is_completed: false,
  };

  return matchForService;
}

export function transformAddMatchRequestToMatchPlayer(
  data: DuelPlayerRequest,
  match_id: string,
  player_id: string,
  team_id: string
): Omit<MatchPlayer, "id"> {
  const matchPlayerForService: Omit<MatchPlayer, "id"> = {
    created_at: new Date(Date.now()),
    match_id: match_id,
    dashboard_player_id: player_id,
    team_id: team_id,
    is_home: data.isHome,
    goals: data.goals,
    assists: data.assists,
    position: data.position,
    penalty_scored: data.penaltyScored ?? null,
  };

  return matchPlayerForService;
}

export function transformAddCompetitionRequestToService(
  data: createCompetitionRequest,
  dashboardId: string
): Omit<Competition, "id"> {
  const competition: Omit<Competition, "id"> = {
    dashboard_id: dashboardId,
    name: data.name,
    type: data.type,
    created_at: new Date(Date.now()),
    track_seasons: data.track_seasons,
    current_season: data.current_season ?? 1,
    voting_enabled: data.voting_enabled,
    voting_period_days: data.voting_period_days ?? null,
    knockout_voting_period_days: data.knockout_voting_period_days ?? null,
    reminder_days: data.reminder_days ?? null,
    min_players: data.min_players ?? 4,
  };

  return competition;
}

export function transformDashboardServiceToResponse(
  data: DashboardWithDetails
): DashboardResponse {
  const mappedCompetitions: CompetitionResponse[] = data.competitions.map(
    (comp) => {
      const mappedMatches: MatchResponse[] = comp.matches.map((match) => {
        const matchPlayers = match.matchPlayers.map((player) => ({
          id: player.id,
          nickname: player.dashboard_player.nickname,
          isHome: player.is_home,
          goals: player.goals,
          assists: player.assists,
          position: player.position,
          penalty_scored: player.penalty_scored ?? undefined,
          rating: calculatePlayerScore(
            player.received_votes,
            match.player_votes
          ),
        }));

        return {
          id: match.id,
          date: match.date.toLocaleDateString(),
          match_type: match.match_type as MatchResponse["match_type"],
          round: match.round,
          home_team_score: match.home_team_score,
          away_team_score: match.away_team_score,
          penalty_home_score: match.penalty_home_score ?? undefined,
          penalty_away_score: match.penalty_away_score ?? undefined,
          teams: match.match_teams.map((matchTeam) => matchTeam.team.name),
          players: matchPlayers,
        };
      });

      const playerStats: PlayerTotals[] = comp.matches
        .flatMap((match) => match.matchPlayers)
        .reduce((acc, matchPlayer) => {
          const existingPlayer = acc.find(
            (player) => player.id === matchPlayer.dashboard_player_id
          );
          if (existingPlayer) {
            existingPlayer.matches += 1;
            existingPlayer.goals += matchPlayer.goals;
            existingPlayer.assists += matchPlayer.assists;
            existingPlayer.penalty_scored =
              (existingPlayer.penalty_scored ?? 0) +
              (matchPlayer.penalty_scored ? 1 : 0);
          } else {
            acc.push({
              id: matchPlayer.dashboard_player_id,
              nickname: matchPlayer.dashboard_player.nickname,
              matches: 1,
              goals: matchPlayer.goals,
              assists: matchPlayer.assists,
              penalty_scored: matchPlayer.penalty_scored ? 1 : 0,
              votes: matchPlayer.received_votes.map((vote) => vote.points),
            });
          }
          return acc;
        }, [] as PlayerTotals[]);

      return {
        id: comp.id,
        name: comp.name,
        type: comp.type as CompetitionResponse["type"],
        matches: mappedMatches,
        player_stats: playerStats,
      };
    }
  );

  return {
    id: data.id,
    name: data.name,
    user: data.admin.given_name,
    competitions: mappedCompetitions,
  };
}

export function transformDashboardMatchesToResponse(
  data: MatchWithTeams[]
): DashboardMatchResponse[] {
  const matchesResponse: DashboardMatchResponse[] = data.map((match) => ({
    id: match.id,
    competition_type: match.competition
      .type as DashboardMatchResponse["competition_type"],
    competition_name: match.competition.name,
    date: match.date.toLocaleDateString(),
    match_type: match.match_type as DashboardMatchResponse["match_type"],
    round: match.round,
    home_team_score: match.home_team_score,
    away_team_score: match.away_team_score,
    penalty_home_score: match.penalty_home_score ?? undefined,
    penalty_away_score: match.penalty_away_score ?? undefined,
    teams: match.match_teams.map((matchTeam) => matchTeam.team.name),
    match_players: match.matchPlayers.length,
    voting_status:
      match.voting_status as DashboardMatchResponse["voting_status"],
  }));

  return matchesResponse;
}

export function transformDashboardCompetitionsToResponse(
  data: CompetitionWithMatches[]
): DashboardCompetitionResponse[] {
  const competitions: DashboardCompetitionResponse[] = data.map((comp) => ({
    id: comp.id,
    name: comp.name,
    type: comp.type as DashboardCompetitionResponse["type"],
    matches: comp.matches.length,
  }));

  return competitions;
}

const getNumUniquePlayers = (
  matchPlayers: MatchPlayerWithDetails[]
): number => {
  const uniqueNicknames = new Set(
    matchPlayers.map((player) => player.dashboard_player.nickname)
  );
  return uniqueNicknames.size;
};

export function transformDashboardCompetitionsToDetailedResponse(
  data: CompetitionWithDetails[]
): DetailedCompetitionResponse[] {
  const competitions: DetailedCompetitionResponse[] = data.map((comp) => ({
    id: comp.id,
    name: comp.name,
    type: comp.type as DetailedCompetitionResponse["type"],
    teams: comp.team_competitions.length,
    players: getNumUniquePlayers(
      comp.matches.flatMap((match) => match.matchPlayers)
    ),
    matches: comp.matches.length,
    votingEnabled: comp.voting_enabled,
    pendingVotes: comp.voting_enabled ? 0 : undefined,
  }));

  return competitions;
}

export function transformCompetitionToResponse(
  data: CompetitionWithDetails
): CompetitionResponse {
  const matches: MatchResponse[] = data.matches.map((match) => ({
    id: match.id,
    date: match.date.toLocaleDateString(),
    match_type: match.match_type as MatchResponse["match_type"],
    round: match.round,
    home_team_score: match.home_team_score,
    away_team_score: match.away_team_score,
    penalty_home_score: match.penalty_home_score ?? undefined,
    penalty_away_score: match.penalty_away_score ?? undefined,
    teams: match.match_teams.map((matchTeam) => matchTeam.team.name),
    players: match.matchPlayers.map((player) => {
      return {
        id: player.id,
        nickname: player.dashboard_player.nickname,
        isHome: player.is_home,
        goals: player.goals,
        assists: player.assists,
        position: player.position,
        penalty_scored: player.penalty_scored ?? undefined,
        rating: calculatePlayerScore(player.received_votes, match.player_votes),
      };
    }),
  }));

  const playerStats: PlayerTotals[] = data.matches
    .flatMap((match) => match.matchPlayers)
    .reduce((acc, matchPlayer) => {
      const existingPlayer = acc.find(
        (player) => player.id === matchPlayer.dashboard_player_id
      );
      if (existingPlayer) {
        existingPlayer.matches += 1;
        existingPlayer.goals += matchPlayer.goals;
        existingPlayer.assists += matchPlayer.assists;
        existingPlayer.penalty_scored =
          (existingPlayer.penalty_scored ?? 0) +
          (matchPlayer.penalty_scored ? 1 : 0);
      } else {
        acc.push({
          id: matchPlayer.dashboard_player_id,
          nickname: matchPlayer.dashboard_player.nickname,
          matches: 1,
          goals: matchPlayer.goals,
          assists: matchPlayer.assists,
          penalty_scored: matchPlayer.penalty_scored ? 1 : 0,
          votes: matchPlayer.received_votes.map((vote) => vote.points),
        });
      }
      return acc;
    }, [] as PlayerTotals[]);

  return {
    id: data.id,
    name: data.name,
    type: data.type as CompetitionResponse["type"],
    matches: matches,
    player_stats: playerStats,
  };
}

export function transformDashboardVotesToResponse(
  data: DashboardVoteService[]
): DashboardVoteResponse[] {
  const votes: DashboardVoteResponse[] = data.map((vote) => ({
    id: vote.id,
    points: vote.points,
    match: {
      id: vote.match.id,
      home_team_score: vote.match.home_team_score,
      away_team_score: vote.match.away_team_score,
      voting_status: vote.match
        .voting_status as DashboardVoteResponse["match"]["voting_status"],
    },
    competition: {
      id: vote.match.competition.id,
      name: vote.match.competition.name,
      type: vote.match.competition
        .type as DashboardVoteResponse["competition"]["type"],
    },
    voter: {
      id: vote.voter.id,
      nickname: vote.voter.nickname,
    },
    match_player: {
      id: vote.player_match.id,
      player_id: vote.player_match.dashboard_player.id,
      nickname: vote.player_match.dashboard_player.nickname,
      team_id: vote.player_match.team.id,
      team: vote.player_match.team.name,
    },
  }));

  return votes;
}

export function transformCompetitionServiceToPendingVotes(
  data: CompetitionWithPendingVotes
): CompetitionVotes {
  const pendingVotes: PendingVote[] = data.matches.flatMap((match) => {
    const players = match.matchPlayers.flatMap((player) => ({
      playerId: player.dashboard_player_id,
      name: player.dashboard_player.nickname,
      voted: player.dashboard_player.votes_given
        .map((match) => match.match_id)
        .includes(match.id),
    }));

    const teams = match.match_teams.flatMap((mt) => mt.team.name);

    return players.map((p) => ({
      matchId: match.id,
      matchDate: match.date.toDateString(),
      playerName: p.name,
      playerId: p.playerId,
      voted: p.voted,
      teams: teams,
      homeScore: match.home_team_score,
      awayScore: match.away_team_score,
    }));
  });

  return {
    competitionId: data.id,
    competitionName: data.name,
    pendingVotes: pendingVotes,
  };
}
