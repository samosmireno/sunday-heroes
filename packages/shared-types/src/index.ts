import { CompetitionType, MatchType, Role, VotingStatus } from "./enums";

export * from "./schemas";
export * from "./enums";

export type PlayerResponse = {
  id: string;
  nickname: string;
  isHome: boolean;
  goals: number;
  assists: number;
  position: number;
  rating: number;
  penaltyScored?: boolean;
};

export type PlayerTotals = {
  id: string;
  nickname: string;
  matches: number;
  goals: number;
  assists: number;
  penaltyScored?: number;
  rating?: number;
};

export interface LeaguePlayerTotals extends PlayerTotals {
  teamName: string;
}

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
};

export type DuelPlayerRequest = {
  nickname: string;
  isHome: boolean;
  goals: number;
  assists: number;
  position: number;
  penaltyScored?: boolean;
};

export type CompetitionResponse = {
  id: string;
  name: string;
  type: CompetitionType;
  userRole: Role;
  votingEnabled: boolean;
  teams?: {
    id: string;
    name: string;
  }[];
  matches: MatchResponse[];
  playerStats: PlayerTotals[];
  moderators: {
    id: string;
    nickname: string;
  }[];
};

export type DashboardResponse = {
  id: string;
  name: string;
  user: string;
  activeCompetitions: number;
  totalPlayers: number;
  pendingVotes: number;
  completedMatches: number;
};

export type DashboardMatchResponse = {
  id: string;
  competitionType: CompetitionType;
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

export type DashboardCompetitionResponse = {
  id: string;
  name: string;
  type: CompetitionType;
  matches: number;
};

export type DetailedCompetitionResponse = {
  id: string;
  userRole: Role;
  name: string;
  type: CompetitionType;
  teams: number;
  players: number;
  matches: number;
  votingEnabled: boolean;
  pendingVotes?: number;
};

export type UserResponse = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type PendingVote = {
  playerName: string;
  playerId: string;
  voted: boolean;
  isUser: boolean;
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
  pendingVotes: number;
  playerStats: PlayerResponse[];
};

export type CompetitionVotingData = {
  id: string;
  name: string;
  pendingVotesCount: number;
  closedVotesCount: number;
};

export type PlayerListResponse = {
  id: string;
  nickname: string;
  competitionsCount: number;
  totalMatches: number;
  totalGoals: number;
  totalAssists: number;
  averageRating: number | null;
  isRegistered: boolean;
  email?: string;
  competitions: CompetitionPlayerList[];
};

export type CompetitionPlayerList = {
  id: string;
  name: string;
  matches: number;
  goals: number;
  assists: number;
  averageRating: number | null;
};

export type PlayerListRequest = {
  searchTerm?: string;
  page?: number;
  limit?: number;
};

export interface SuccessResponse<T = any> {
  data?: T;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

export interface ValidationErrorResponse {
  error: string;
  validation_errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type OrderStatsByOption = "goals" | "assists" | "rating" | "matches";

export interface LeagueTeamResponse {
  id: string;
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  goalDifference: number;
  team: {
    id: string;
    name: string;
  };
}

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
}
