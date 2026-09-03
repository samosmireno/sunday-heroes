import { LeagueMatchResponse } from "@repo/shared-types";

type FixtureState = Pick<
  LeagueMatchResponse,
  "isCompleted" | "season" | "homeScore" | "awayScore"
>;

/**
 * A Fixture that was still not completed when its Season closed. It stays in
 * its round as history (ADR 0002) and is shown dimmed with a tag, so it is
 * never read as a result.
 */
export const leftNotCompleted = (
  match: Pick<FixtureState, "isCompleted" | "season">,
): boolean => match.season.isClosed && !match.isCompleted;

const DASH = "–";

/**
 * The score a card or the details header shows. A Fixture left not completed
 * with no score entered shows dashes rather than 0–0, so it is not mistaken
 * for a goalless draw; every other Fixture shows its score as stored.
 */
export function displayedScore(match: FixtureState): {
  home: string;
  away: string;
} {
  const noScoreEntered = match.homeScore === 0 && match.awayScore === 0;
  if (leftNotCompleted(match) && noScoreEntered) {
    return { home: DASH, away: DASH };
  }
  return { home: String(match.homeScore), away: String(match.awayScore) };
}
