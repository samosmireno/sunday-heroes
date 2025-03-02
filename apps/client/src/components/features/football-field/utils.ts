import { MatchResponse } from "@repo/logger";

export default function findStarPlayer(match: MatchResponse): string | null {
  if (match && match.players?.length > 0) {
    if (match.players.every((player) => player?.votes?.length === 0))
      return null;

    const starPlayer = match.players.reduce((prev, curr) => {
      const prevRating = prev?.votes?.length
        ? prev.votes.reduce((a, b) => a + b, 0) / prev.votes.length
        : 0;
      const currRating = curr?.votes?.length
        ? curr.votes.reduce((a, b) => a + b, 0) / curr.votes.length
        : 0;
      return prevRating > currRating ? prev : curr;
    });

    return starPlayer.id;
  }
  return null;
}
