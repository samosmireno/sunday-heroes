import { MatchPlayer } from "@prisma/client";
import { DuelPlayerRequest } from "@repo/shared-types";

export function transformAddMatchRequestToMatchPlayer(
  player: DuelPlayerRequest,
  matchId: string,
  dashboardPlayerId: string,
  teamId: string
): Omit<MatchPlayer, "id"> {
  const matchPlayerForService: Omit<MatchPlayer, "id"> = {
    createdAt: new Date(Date.now()),
    matchId,
    dashboardPlayerId,
    teamId,
    isHome: player.isHome,
    goals: player.goals,
    assists: player.assists,
    position: player.position,
    penaltyScored: player.penaltyScored ?? null,
    rating: null,
    isMotm: false,
  };

  return matchPlayerForService;
}
