import { CompetitionType, MatchType, VotingStatus } from "./enums";
import { PlayerResponse } from "./player";
import { MatchSeason } from "./season";
import { VoterEligibility } from "./voting";

export type MatchResponse = {
  id: string;
  date?: string;
  matchType: MatchType;
  round: number;
  homeTeamScore: number;
  awayTeamScore: number;
  penaltyHomeScore?: number;
  penaltyAwayScore?: number;
  isCompleted: boolean;
  teams: string[];
  players: PlayerResponse[];
  videoUrl?: string;
  season: MatchSeason;
};

export type MatchPageResponse = {
  id: string;
  date?: string;
  competitionId: string;
  competitionName: string;
  competitionType: CompetitionType;
  isAdmin: boolean;
  teams: string[];
  scores: number[];
  penaltyScores?: number[];
  matchType: MatchType;
  votingEnabled: boolean;
  votingStatus: VotingStatus;
  votingEndsAt?: string;
  playerCount: number;
  /**
   * Non-voters whose ballot the Competition is still waiting for. Only
   * Eligible voters count: a vote the Voting gate will never accept is not
   * pending, it is impossible.
   */
  pendingVotes: number;
  /**
   * Where the viewer stands with this Competition's Voting gate. Always
   * present: `threshold: null` means the Competition has no gate, and a viewer
   * who is nobody on this dashboard reads as a player who has played nothing.
   */
  viewerEligibility: VoterEligibility;
  /**
   * Whether the viewer was on this match. The blocked vote affordance is
   * scoped to a match the viewer played: a non-participant has no ballot on it
   * at all, so a Current-season counter there would be a number about a match
   * they were never part of.
   */
  viewerPlayed: boolean;
  playerStats: PlayerResponse[];
  videoUrl?: string;
  season: MatchSeason;
};

export interface LeagueMatchResponse {
  id: string;
  homeTeam: {
    id: string;
    name: string;
    score: number;
    penaltyScore?: number;
  };
  awayTeam: {
    id: string;
    name: string;
    score: number;
    penaltyScore?: number;
  };
  homeScore: number;
  awayScore: number;
  date: string | null;
  round: number;
  votingStatus: string;
  isCompleted: boolean;
  videoUrl?: string;
  season: MatchSeason;
}
