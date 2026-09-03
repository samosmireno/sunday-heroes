import {
  LeagueMatchResponse,
  LeaguePlayerTotals,
  LeagueTeamResponse,
  MatchResponse,
} from "@repo/shared-types";
import { CompetitionWithDetails } from "../repositories/competition/types";
import { MatchWithDetails } from "../repositories/match/types";
import { calculateLeaguePlayerStats, calculatePlayerScore } from "./utils";
import { transformMatchSeasonToResponse } from "./season-transforms";
import { TeamCompetitionWithDetails } from "../repositories/team-competition-repo";
import { compareStandings, standingsRow } from "./standings";

export function transformLeagueFixtureToResponse(
  fixture: Record<number, MatchWithDetails[]>,
): Record<number, LeagueMatchResponse[]> {
  const transformedFixtures: Record<number, LeagueMatchResponse[]> = {};

  for (const [round, matches] of Object.entries(fixture)) {
    transformedFixtures[Number(round)] = matches.map((match) => ({
      id: match.id,
      homeTeam: {
        id: match.matchTeams[0].teamId,
        name: match.matchTeams[0].team.name,
        score: match.homeTeamScore,
      },
      awayTeam: {
        id: match.matchTeams[1].teamId,
        name: match.matchTeams[1].team.name,
        score: match.awayTeamScore,
      },
      homeScore: match.homeTeamScore,
      awayScore: match.awayTeamScore,
      date: match.date ? match.date.toISOString() : null,
      round: match.round,
      votingStatus: match.votingStatus,
      isCompleted: match.isCompleted,
      videoUrl: match.videoUrl ?? undefined,
      season: transformMatchSeasonToResponse(match.season),
    }));
  }

  return transformedFixtures;
}

export function transformCompetitionToPlayerStatsResponse(
  competition: CompetitionWithDetails,
): LeaguePlayerTotals[] {
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
          penalty_scored: player.penaltyScored ?? undefined,
          rating:
            player.rating ??
            calculatePlayerScore(player.receivedVotes, match.playerVotes),
          manOfTheMatch: player.isMotm,
        };
      }),
      season: transformMatchSeasonToResponse(match.season),
    };
  });

  const playerStats: LeaguePlayerTotals[] = calculateLeaguePlayerStats(matches);

  return playerStats;
}

/** The Current season's Standings: the live counters, ranked. */
export function transformTeamCompetitionToStandingsResponse(
  teamCompetition: TeamCompetitionWithDetails[],
): LeagueTeamResponse[] {
  return teamCompetition
    .map((tc) => standingsRow(tc.team, tc))
    .sort(compareStandings);
}
