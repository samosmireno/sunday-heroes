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
  penalty_scored?: boolean;
};

export type PlayerTotals = {
  id: string;
  nickname: string;
  matches: number;
  goals: number;
  assists: number;
  penalty_scored?: number;
  rating?: number;
};

export type MatchResponse = {
  id: string;
  date: string;
  match_type: MatchType;
  round: number;
  home_team_score: number;
  away_team_score: number;
  penalty_home_score?: number;
  penalty_away_score?: number;
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
  votingEnabled: boolean;
  matches: MatchResponse[];
  player_stats: PlayerTotals[];
};

export type DashboardResponse = {
  id: string;
  name: string;
  user: string;
  competitions: CompetitionResponse[];
};

export type DashboardMatchResponse = {
  id: string;
  competition_type: CompetitionType;
  competition_name: string;
  date: string;
  match_type: MatchType;
  round: number;
  home_team_score: number;
  away_team_score: number;
  penalty_home_score?: number;
  penalty_away_score?: number;
  teams: string[];
  match_players: number;
  voting_status: VotingStatus;
};

export type DashboardCompetitionResponse = {
  id: string;
  name: string;
  type: CompetitionType;
  matches: number;
};

export type DetailedCompetitionResponse = {
  id: string;
  name: string;
  type: CompetitionType;
  teams: number;
  players: number;
  matches: number;
  votingEnabled: boolean;
  pendingVotes?: number;
};

export type DashboardVoteResponse = {
  id: string;
  points: number;
  match: {
    id: string;
    home_team_score: number;
    away_team_score: number;
    voting_status: VotingStatus;
  };
  competition: {
    id: string;
    name: string;
    type: CompetitionType;
  };
  voter: {
    id: string;
    nickname: string;
  };
  match_player: {
    id: string;
    player_id: string;
    nickname: string;
    team_id: string;
    team: string;
  };
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
};
export type MatchVotes = {
  matchId: string;
  matchDate: string;
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
  date: string;
  competitionId: string;
  competitionName: string;
  competitionType: CompetitionType;
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
