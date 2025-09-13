import { MatchResponse, MatchType } from "@repo/shared-types";
import { playerIconSizeType } from "../player/styles";

export default function findStarPlayer(
  match?: MatchResponse,
): string | undefined {
  if (!match || match.players.length === 0) return undefined;

  const starPlayer = match.players.reduce((maxPlayer, currentPlayer) =>
    currentPlayer.rating > maxPlayer.rating ? currentPlayer : maxPlayer,
  );

  return starPlayer.rating === 0 ? undefined : starPlayer.id;
}

export const getPlayerSizeByMatchType = (
  matchType: MatchType,
): playerIconSizeType => {
  switch (matchType) {
    case MatchType.FIVE_A_SIDE:
    case MatchType.SIX_A_SIDE:
      return "large";
    case MatchType.SEVEN_A_SIDE:
      return "medium";
    case MatchType.ELEVEN_A_SIDE:
      return "small";
    default:
      return "medium";
  }
};
