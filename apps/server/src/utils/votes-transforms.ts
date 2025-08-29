import { CompetitionVotes, MatchVotes, PendingVote } from "@repo/shared-types";
import { MatchWithDetails } from "../repositories/match-repo";
import { getUserRole } from "./competition-transforms";
import { CompetitionWithDetails } from "../repositories/competition/competition-repo";

export function transformMatchServiceToPendingVotes(
  match: MatchWithDetails,
  competition: CompetitionWithDetails,
  userId: string
): MatchVotes {
  const players = match.matchPlayers.flatMap((player) => ({
    playerId: player.dashboardPlayerId,
    playerUserId: player.dashboardPlayer.userId,
    name: player.dashboardPlayer.nickname,
    voted: player.dashboardPlayer.votesGiven
      .map((match) => match.matchId)
      .includes(match.id),
  }));

  const teams = match.matchTeams.flatMap((mt) => mt.team.name);

  return {
    userRole: getUserRole(competition, userId),
    matchId: match.id,
    matchDate: match.date?.toDateString(),
    competitionId: match.competition.id,
    competitionName: match.competition.name,
    players: players.map((p) => ({
      playerName: p.name,
      playerId: p.playerId,
      voted: p.voted,
      isUser: p.playerUserId === userId,
    })),
    teams: teams,
    homeScore: match.homeTeamScore,
    awayScore: match.awayTeamScore,
  };
}
