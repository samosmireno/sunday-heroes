import { CompetitionVotes, MatchVotes, PendingVote } from "@repo/shared-types";
import { CompetitionWithPendingVotes } from "../repositories/competition/competition-voting-repo";
import { MatchWithDetails } from "../repositories/match-repo";

export function transformCompetitionServiceToPendingVotes(
  competition: CompetitionWithPendingVotes
): CompetitionVotes {
  const pendingVotes: PendingVote[] = competition.matches.flatMap((match) => {
    const players = match.matchPlayers.flatMap((player) => ({
      playerId: player.dashboardPlayerId,
      name: player.dashboardPlayer.nickname,
      voted: player.dashboardPlayer.votesGiven
        .map((match) => match.matchId)
        .includes(match.id),
    }));

    const teams = match.matchTeams.flatMap((mt) => mt.team.name);

    return players.map((p) => ({
      matchId: match.id,
      matchDate: match.date?.toDateString(),
      playerName: p.name,
      playerId: p.playerId,
      voted: p.voted,
      teams: teams,
      homeScore: match.homeTeamScore,
      awayScore: match.awayTeamScore,
    }));
  });

  return {
    competitionId: competition.id,
    competitionName: competition.name,
    pendingVotes: pendingVotes,
  };
}

export function transformMatchServiceToPendingVotes(
  match: MatchWithDetails
): MatchVotes {
  const players = match.matchPlayers.flatMap((player) => ({
    playerId: player.dashboardPlayerId,
    name: player.dashboardPlayer.nickname,
    voted: player.dashboardPlayer.votesGiven
      .map((match) => match.matchId)
      .includes(match.id),
  }));

  const teams = match.matchTeams.flatMap((mt) => mt.team.name);

  return {
    matchId: match.id,
    matchDate: match.date?.toDateString(),
    competitionId: match.competition.id,
    competitionName: match.competition.name,
    players: players.map((p) => ({
      playerName: p.name,
      playerId: p.playerId,
      voted: p.voted,
    })),
    teams: teams,
    homeScore: match.homeTeamScore,
    awayScore: match.awayTeamScore,
  };
}
