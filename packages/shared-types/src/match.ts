import { MatchType, VotingStatus } from "./enums";
import { PlayerResponse } from "./player";

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
};

export type DashboardMatchResponse = {
  id: string;
  competitionType: import("./enums").CompetitionType;
  competitionName: string;
  date?: string;
  matchType: MatchType;
  round: number;
  homeTeamScore: number;
  awayTeamScore: number;
  penaltyHomeScore?: number;
  penaltyAwayScore?: number;
  teams: string[];
  matchPlayers: number;
  votingStatus: VotingStatus;
};

export type MatchPageResponse = {
  id: string;
  date?: string;
  competitionId: string;
  competitionName: string;
  competitionType: import("./enums").CompetitionType;
  isAdmin: boolean;
  teams: string[];
  scores: number[];
  penaltyScores?: number[];
  matchType: MatchType;
  votingEnabled: boolean;
  votingStatus: VotingStatus;
  votingEndsAt?: string;
  playerCount: number;
  pendingVotes: number;
  playerStats: PlayerResponse[];
  videoUrl?: string;
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
}
