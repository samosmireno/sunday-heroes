export * from "./schemas";

export enum Team {
  HOME = "Home",
  AWAY = "Away",
}

export enum CompetitionType {
  LEAGUE = "LEAGUE",
  DUEL = "DUEL",
  KNOCKOUT = "KNOCKOUT",
}

export enum MatchType {
  FIVE_A_SIDE = "FIVE_A_SIDE",
  SIX_A_SIDE = "SIX_A_SIDE",
  SEVEN_A_SIDE = "SEVEN_A_SIDE",
  ELEVEN_A_SIDE = "ELEVEN_A_SIDE",
}

export enum VotingStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export enum Role {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  PLAYER = "PLAYER",
}

export type PlayerResponse = {
  id: string;
  nickname: string;
  isHome: boolean;
  goals: number;
  assists: number;
  position: number;
  penalty_scored?: boolean;
  votes?: number[];
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
