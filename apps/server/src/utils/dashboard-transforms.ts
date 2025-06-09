import {
  CompetitionResponse,
  DashboardCompetitionResponse,
  DashboardMatchResponse,
  DashboardResponse,
  DashboardVoteResponse,
  DetailedCompetitionResponse,
  MatchResponse,
  PlayerTotals,
} from "@repo/logger";
import {
  CompetitionWithDetails,
  CompetitionWithMatches,
} from "../repositories/competition-repo";
import { MatchPlayerWithDetails } from "../repositories/match-player-repo";
import { DashboardVoteService } from "../repositories/vote-repo";
import { MatchWithTeams } from "../repositories/match-repo";
import { DashboardWithDetails } from "../repositories/dashboard-repo";
import { calculatePlayerScore, calculatePlayerStats } from "./utils";
import { getUserRole } from "./competition-transforms";

export function transformDashboardServiceToResponse(
  dashboard: DashboardWithDetails,
  userId: string
): DashboardResponse {
  const mappedCompetitions: CompetitionResponse[] = dashboard.competitions.map(
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

      const playerStats: PlayerTotals[] = calculatePlayerStats(mappedMatches);

      const competitionWithDetails = {
        ...comp,
        dashboard: {
          id: dashboard.id,
          admin_id: dashboard.admin.id,
        },
        team_competitions: [],
        moderators: comp.moderators.map((moderator) => ({
          id: moderator.id,
          dashboard_player: {
            id: moderator.dashboard_player_id,
            user_id: null,
            nickname: moderator.dashboard_player.nickname,
          },
        })),
      };

      return {
        id: comp.id,
        name: comp.name,
        type: comp.type as CompetitionResponse["type"],
        userRole: getUserRole(competitionWithDetails, userId),
        votingEnabled: comp.voting_enabled,
        matches: mappedMatches,
        player_stats: playerStats,
        moderators: comp.moderators.map((moderator) => ({
          id: moderator.id,
          nickname: moderator.dashboard_player.nickname,
        })),
      };
    }
  );

  return {
    id: dashboard.id,
    name: dashboard.name,
    user: dashboard.admin.given_name,
    competitions: mappedCompetitions,
  };
}

export function transformDashboardMatchesToResponse(
  matches: MatchWithTeams[]
): DashboardMatchResponse[] {
  const matchesResponse: DashboardMatchResponse[] = matches.map((match) => ({
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
  comps: CompetitionWithMatches[]
): DashboardCompetitionResponse[] {
  const competitions: DashboardCompetitionResponse[] = comps.map((comp) => ({
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
  userId: string,
  comps: CompetitionWithDetails[]
): DetailedCompetitionResponse[] {
  const competitions: DetailedCompetitionResponse[] = comps.map((comp) => ({
    id: comp.id,
    userRole: getUserRole(comp, userId),
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

export function transformDashboardVotesToResponse(
  dashVotes: DashboardVoteService[]
): DashboardVoteResponse[] {
  const votes: DashboardVoteResponse[] = dashVotes.map((vote) => ({
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
