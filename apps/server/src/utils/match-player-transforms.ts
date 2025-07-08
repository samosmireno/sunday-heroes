import { MatchPlayer } from "@prisma/client";
import { DuelPlayerRequest } from "@repo/shared-types";

export function transformAddMatchRequestToMatchPlayer(
  player: DuelPlayerRequest,
  match_id: string,
  player_id: string,
  team_id: string
): Omit<MatchPlayer, "id"> {
  const matchPlayerForService: Omit<MatchPlayer, "id"> = {
    created_at: new Date(Date.now()),
    match_id: match_id,
    dashboard_player_id: player_id,
    team_id: team_id,
    is_home: player.isHome,
    goals: player.goals,
    assists: player.assists,
    position: player.position,
    penalty_scored: player.penaltyScored ?? null,
  };

  return matchPlayerForService;
}
