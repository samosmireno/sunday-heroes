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
import { NotFoundError } from "./errors";

/** One side of a League Match: the home or the away team with its score. */
function transformMatchSide(
  match: MatchWithDetails,
  isHome: boolean,
): LeagueMatchResponse["homeTeam"] {
  const side = match.matchTeams.find(
    (matchTeam) => matchTeam.isHome === isHome,
  );
  if (!side) {
    throw new NotFoundError("Match team");
  }
  return {
    id: side.teamId,
    name: side.team.name,
    score: isHome ? match.homeTeamScore : match.awayTeamScore,
  };
}

/** The fixtures read's answer, in the order the read returns them. */
export function transformLeagueFixturesToResponse(
  fixtures: MatchWithDetails[],
): LeagueMatchResponse[] {
  return fixtures.map((match) => ({
    id: match.id,
    homeTeam: transformMatchSide(match, true),
    awayTeam: transformMatchSide(match, false),
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
