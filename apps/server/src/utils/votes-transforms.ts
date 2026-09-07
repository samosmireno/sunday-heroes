import { MatchVotes } from "@repo/shared-types";
import { MatchWithVotes } from "../repositories/match/types";
import { getUserRole } from "./competition-transforms";
import { CompetitionWithSettings } from "../repositories/competition/types";
import { VotingEligibility } from "./voting-eligibility";

/**
 * The admin's on-behalf-of list. Every participant stays on it, the ones the
 * Voting gate has shut out included: hiding them would leave the admin
 * wondering where a name went, and the gate decides who *gives* votes, never
 * who is on the ballot. Each row therefore carries its own standing, read off
 * the one eligibility answer loaded for the match's Competition.
 */
export function transformMatchServiceToPendingVotes(
  match: MatchWithVotes,
  competition: CompetitionWithSettings,
  userId: string,
  eligibility: VotingEligibility,
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
      eligibility: eligibility.for(p.playerId),
    })),
    teams: teams,
    homeScore: match.homeTeamScore,
    awayScore: match.awayTeamScore,
  };
}
