import { MatchPlayerWithMatchDetails } from "../repositories/match-player/types";
import {
  TopMatchResponse,
  CompetitionType,
  PerformanceDataPoint,
} from "@repo/shared-types";

export const transformTopMatchPlayerToMatch = (
  matchPlayer: MatchPlayerWithMatchDetails | null
): TopMatchResponse | null => {
  if (!matchPlayer) return null;

  const playerScore = matchPlayer.isHome
    ? matchPlayer.match.homeTeamScore
    : matchPlayer.match.awayTeamScore;
  const opponentScore = matchPlayer.isHome
    ? matchPlayer.match.awayTeamScore
    : matchPlayer.match.homeTeamScore;

  let result: "W" | "D" | "L";
  if (playerScore > opponentScore) result = "W";
  else if (playerScore === opponentScore) result = "D";
  else result = "L";

  const opponentTeam = matchPlayer.match.matchTeams.find(
    (mt) => mt.isHome !== matchPlayer.isHome
  );

  return {
    matchId: matchPlayer.match.id,
    opponent: opponentTeam?.team.name || "Unknown",
    competition: {
      id: matchPlayer.match.competition.id,
      name: matchPlayer.match.competition.name,
      type: matchPlayer.match.competition.type as CompetitionType,
      round: matchPlayer.match.round.toString(),
    },
    date: matchPlayer.match.date?.toISOString() || "",
    result,
    score: {
      playerTeam: playerScore,
      opponent: opponentScore,
    },
    goals: matchPlayer.goals,
    assists: matchPlayer.assists,
    rating: matchPlayer.rating || 0,
  };
};

export const transformMatchPlayerToPerformanceData = (
  matchPlayers: MatchPlayerWithMatchDetails[]
): PerformanceDataPoint[] => {
  return matchPlayers.reverse().map((mp) => {
    const playerScore = mp.isHome
      ? mp.match.homeTeamScore
      : mp.match.awayTeamScore;
    const opponentScore = mp.isHome
      ? mp.match.awayTeamScore
      : mp.match.homeTeamScore;

    let result: "W" | "D" | "L";
    if (playerScore > opponentScore) result = "W";
    else if (playerScore === opponentScore) result = "D";
    else result = "L";

    const opponentTeam = mp.match.matchTeams.find(
      (mt) => mt.isHome !== mp.isHome
    );

    return {
      matchId: mp.match.id,
      date: mp.match.date?.toISOString() || "",
      opponent: opponentTeam?.team.name || "Unknown",
      competitionName: mp.match.competition.name,
      result,
      goals: mp.goals,
      assists: mp.assists,
      rating: mp.rating || 0,
    };
  });
};
