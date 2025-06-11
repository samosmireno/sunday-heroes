import { CompetitionVotes, MatchVotes, PendingVote } from "@repo/logger";
import { CompetitionWithPendingVotes } from "../repositories/competition/competition-voting-repo";
import { MatchWithDetails } from "../repositories/match-repo";

export function transformCompetitionServiceToPendingVotes(
  competition: CompetitionWithPendingVotes
): CompetitionVotes {
  const pendingVotes: PendingVote[] = competition.matches.flatMap((match) => {
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
    competitionId: competition.id,
    competitionName: competition.name,
    pendingVotes: pendingVotes,
  };
}

export function transformMatchServiceToPendingVotes(
  match: MatchWithDetails
): MatchVotes {
  const players = match.matchPlayers.flatMap((player) => ({
    playerId: player.dashboard_player_id,
    name: player.dashboard_player.nickname,
    voted: player.dashboard_player.votes_given
      .map((match) => match.match_id)
      .includes(match.id),
  }));

  const teams = match.match_teams.flatMap((mt) => mt.team.name);

  return {
    matchId: match.id,
    matchDate: match.date.toDateString(),
    competitionId: match.competition.id,
    competitionName: match.competition.name,
    players: players.map((p) => ({
      playerName: p.name,
      playerId: p.playerId,
      voted: p.voted,
    })),
    teams: teams,
    homeScore: match.home_team_score,
    awayScore: match.away_team_score,
  };
}
