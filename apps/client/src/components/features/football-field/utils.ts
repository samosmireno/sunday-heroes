import { MatchResponse } from "@repo/logger";

export default function findStarPlayer(
  match?: MatchResponse,
): string | undefined {
  if (!match || match.players.length === 0) return undefined;

  const starPlayer = match.players.reduce((maxPlayer, currentPlayer) =>
    currentPlayer.rating > maxPlayer.rating ? currentPlayer : maxPlayer,
  );

  return starPlayer.rating === 0 ? undefined : starPlayer.id;
}
