/**
 * The three names a player picked, held outside React.
 *
 * A selection that lives only in component state is lost to anything that
 * unmounts the page — and the thing that unmounts the page is exactly the
 * thing worth surviving: a session that died between opening the ballot and
 * pressing Submit, which sends the player out through sign-in and back. Kept
 * here, the picks are still there when they return, so the vote costs them one
 * click rather than the whole ballot again.
 *
 * `sessionStorage`, not `localStorage`: a draft is worth exactly one browser
 * tab and one sitting. And every access is guarded — a private window, a
 * browser set to block site data, or an in-app webview can make any of these
 * throw, and a ballot that will not render is worse than a draft that is not
 * kept.
 */

export interface VoteDraftPick {
  id: string;
  rank: number;
}

const draftKey = (matchId: string, voterId: string) =>
  `voteDraft:${matchId}:${voterId}`;

const isPick = (value: unknown): value is VoteDraftPick =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as VoteDraftPick).id === "string" &&
  typeof (value as VoteDraftPick).rank === "number";

/** The picks last saved for this ballot; an empty list if there are none to be had. */
export function readVoteDraft(
  matchId: string,
  voterId: string,
): VoteDraftPick[] {
  try {
    const stored = sessionStorage.getItem(draftKey(matchId, voterId));
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    // Anything can be in there: another tab, an older version of this page, a
    // player with a console. A draft that does not read as picks is no draft.
    if (!Array.isArray(parsed) || !parsed.every(isPick)) return [];

    return parsed;
  } catch {
    return [];
  }
}

export function writeVoteDraft(
  matchId: string,
  voterId: string,
  picks: VoteDraftPick[],
): void {
  try {
    sessionStorage.setItem(draftKey(matchId, voterId), JSON.stringify(picks));
  } catch {
    // Nothing to do and nothing to say: the ballot still works, it just will
    // not survive leaving the page.
  }
}

/** Called once the votes are actually recorded: there is no longer a vote to finish. */
export function clearVoteDraft(matchId: string, voterId: string): void {
  try {
    sessionStorage.removeItem(draftKey(matchId, voterId));
  } catch {
    // As above.
  }
}
