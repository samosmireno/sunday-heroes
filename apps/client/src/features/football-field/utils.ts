import { MatchType } from "@repo/shared-types";
import { playerIconSizeType } from "../player-info/styles";

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
