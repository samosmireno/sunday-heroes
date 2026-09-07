import { Role } from "./enums";

/**
 * Whether one player may vote in one Competition, and how far off they are.
 * Always present on a response, never optional: `threshold: null` means the
 * Competition has no Voting gate, and the client branches on the value rather
 * than on the field being there.
 */
export type VoterEligibility = {
  /** The gate's answer, folding in whether the gate is armed at all. */
  canVote: boolean;
  /** Has reached the Voting threshold in some Season. Permanent once earned. */
  qualified: boolean;
  /** Competition-level, carried on every record so no sibling flag is needed. */
  armed: boolean;
  /** The Competition's Voting threshold; null = no gate. */
  threshold: number | null;
  /** Completed matches played in the Current season. */
  matchesThisSeason: number;
  /** Completed matches still needed this Season, floored at zero. */
  remaining: number;
};

export type PendingVote = {
  playerName: string;
  playerId: string;
  voted: boolean;
  isUser: boolean;
  /**
   * Where this player stands with the Competition's Voting gate. Always
   * present, so the on-behalf-of list can keep an ineligible player listed and
   * say why rather than dropping the row.
   */
  eligibility: VoterEligibility;
};

export type MatchVotes = {
  userRole: Role;
  matchId: string;
  matchDate?: string;
  competitionId: string;
  competitionName: string;
  teams: string[];
  homeScore: number;
  awayScore: number;
  players: PendingVote[];
};

export type CompetitionVotes = {
  competitionId: string;
  competitionName: string;
  pendingVotes: PendingVote[];
};
