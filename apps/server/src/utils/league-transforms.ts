import {
  LeaguePlayerTotals,
  LeagueTeamResponse,
  MatchResponse,
  PlayerTotals,
} from "@repo/logger";
import { CompetitionWithDetails } from "../repositories/competition/competition-repo";
import { MatchWithDetails } from "../repositories/match-repo";
import { calculateLeaguePlayerStats, calculatePlayerScore } from "./utils";
import { TeamCompetition } from "@prisma/client";
import { TeamCompetitionWithDetails } from "../repositories/team-competition-repo";

interface LeagueMatch {
  id: string;
  homeTeam: {
    id: string;
    name: string;
  };
  awayTeam: {
    id: string;
    name: string;
  };
  homeScore: number;
  awayScore: number;
  date: string | null;
  round: number;
  votingStatus: string;
  isCompleted: boolean;
}

export function transformLeagueFixtureToResponse(
  fixture: Record<number, MatchWithDetails[]>
): Record<number, LeagueMatch[]> {
  const transformedFixtures: Record<number, LeagueMatch[]> = {};

  for (const [round, matches] of Object.entries(fixture)) {
    transformedFixtures[Number(round)] = matches.map((match) => ({
      id: match.id,
      homeTeam: {
        id: match.match_teams[0].team_id,
        name: match.match_teams[0].team.name,
      },
      awayTeam: {
        id: match.match_teams[1].team_id,
        name: match.match_teams[1].team.name,
      },
      homeScore: match.home_team_score,
      awayScore: match.away_team_score,
      date: match.date ? match.date.toISOString() : null,
      round: match.round,
      votingStatus: match.voting_status,
      isCompleted: match.is_completed,
    }));
  }

  return transformedFixtures;
}

export function transformCompetitionToPlayerStatsResponse(
  competition: CompetitionWithDetails
): LeaguePlayerTotals[] {
  const matches: MatchResponse[] = competition.matches.map((match) => ({
    id: match.id,
    date: match.date?.toLocaleDateString(),
    match_type: match.match_type as MatchResponse["match_type"],
    round: match.round,
    home_team_score: match.home_team_score,
    away_team_score: match.away_team_score,
    penalty_home_score: match.penalty_home_score ?? undefined,
    penalty_away_score: match.penalty_away_score ?? undefined,
    teams: match.match_teams.map((matchTeam) => matchTeam.team.name),
    is_completed: match.is_completed,
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

  const playerStats: LeaguePlayerTotals[] = calculateLeaguePlayerStats(matches);

  return playerStats;
}

export function transformTeamCompetitionToStandingsResponse(
  teamCompetition: TeamCompetitionWithDetails[]
): LeagueTeamResponse[] {
  const standings = teamCompetition.map((tc) => {
    const team = tc.team;
    return {
      id: team.id,
      name: team.name,
      points: tc.points,
      wins: tc.wins,
      draws: tc.draws,
      losses: tc.losses,
      goalsFor: tc.goals_for,
      goalsAgainst: tc.goals_against,
      goalDifference: tc.goals_for - tc.goals_against,
      played: tc.wins + tc.draws + tc.losses,
      team: {
        id: team.id,
        name: team.name,
      },
    };
  });

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return standings;
}
