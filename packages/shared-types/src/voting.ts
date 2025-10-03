import { Role } from "./enums";

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
