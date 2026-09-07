/**
 * PROTOTYPE — throwaway. Fabricated state for the "what a player who cannot
 * vote yet sees" prototype (issue #37). No server, no database: the dev DB is
 * production and holds no League with a Voting threshold, so every state here
 * is made up in memory.
 */

/** The Voting threshold on this fabricated Competition: 5 Completed matches in one Season. */
export const THRESHOLD = 5;

/** Marko: 4 matches in Season 2, 3 so far in Season 3 — the count is per-Season, so he has not qualified. */
export const VIEWER = {
  nickname: "Marko",
  playedThisSeason: 3,
  playedLastSeason: 4,
  currentSeason: 3,
};

export const REMAINING = THRESHOLD - VIEWER.playedThisSeason;

export const COMPETITION = {
  name: "Thursday Night League",
  completedMatches: 12,
};

/** The match whose voting is open and which Marko played in. */
export const MATCH = {
  id: "match-open",
  teams: ["Lions", "Tigers"],
  scores: [3, 2],
  date: "2026-09-03T19:00:00.000Z",
  votingEndsAt: "2026-09-09T19:00:00.000Z",
};

export interface BallotPlayer {
  id: string;
  nickname: string;
  isHome: boolean;
}

export const BALLOT: BallotPlayer[] = [
  { id: "p1", nickname: "Ana", isHome: true },
  { id: "p2", nickname: "Luka", isHome: true },
  { id: "p3", nickname: "Petar", isHome: true },
  { id: "p4", nickname: "Ivan", isHome: false },
  { id: "p5", nickname: "Marko", isHome: false },
  { id: "p6", nickname: "Nikola", isHome: false },
];

export interface PrototypeMatchRow {
  id: string;
  date: string;
  teams: string[];
  scores: number[];
  votingStatus: "OPEN" | "CLOSED";
  pendingVotes: number;
  /** Whether the viewer played this one — only a match they played raises the question at all. */
  viewerPlayed: boolean;
}

/** The All Matches list as Marko sees it: two open for voting, one already closed. */
export const MATCH_ROWS: PrototypeMatchRow[] = [
  {
    id: "match-open",
    date: "3 Sep 2026",
    teams: ["Lions", "Tigers"],
    scores: [3, 2],
    votingStatus: "OPEN",
    pendingVotes: 4,
    viewerPlayed: true,
  },
  {
    id: "match-open-2",
    date: "27 Aug 2026",
    teams: ["Wolves", "Bears"],
    scores: [1, 1],
    votingStatus: "OPEN",
    pendingVotes: 6,
    viewerPlayed: true,
  },
  {
    id: "match-closed",
    date: "20 Aug 2026",
    teams: ["Lions", "Bears"],
    scores: [0, 4],
    votingStatus: "CLOSED",
    pendingVotes: 0,
    viewerPlayed: false,
  },
];

export interface PendingVoter {
  playerId: string;
  playerName: string;
  voted: boolean;
  /** Reached the threshold in some Season of this Competition. */
  eligible: boolean;
  /** Completed matches in the Current season, for the variants that disclose progress. */
  playedThisSeason: number;
}

/** The pending-votes list an ADMIN opens for the match: who still owes a vote. */
export const PENDING_VOTERS: PendingVoter[] = [
  { playerId: "p1", playerName: "Ana", voted: true, eligible: true, playedThisSeason: 9 },
  { playerId: "p2", playerName: "Luka", voted: false, eligible: true, playedThisSeason: 7 },
  { playerId: "p3", playerName: "Petar", voted: false, eligible: true, playedThisSeason: 5 },
  { playerId: "p5", playerName: "Marko", voted: false, eligible: false, playedThisSeason: 3 },
  { playerId: "p6", playerName: "Nikola", voted: false, eligible: false, playedThisSeason: 1 },
];
