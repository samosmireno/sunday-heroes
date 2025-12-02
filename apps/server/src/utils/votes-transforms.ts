import { MatchVotes } from "@repo/shared-types";
import { MatchWithVotes } from "../repositories/match/types";
import { getUserRole } from "./competition-transforms";
import { CompetitionWithSettings } from "../repositories/competition/types";

export function transformMatchServiceToPendingVotes(
  match: MatchWithVotes,
  competition: CompetitionWithSettings,
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
    competitionId: competition.id,
    competitionName: competition.name,
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
