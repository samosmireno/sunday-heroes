export interface UserTotals {
  id: string;
  nickname: string;
  totalMatches: number;
  totalGoals: number;
  totalAssists: number;
  totalRating: number;
}

export interface MatchDetail {
  id: string;
  date: string;
  players: MatchPlayer[];
  home_team_score: number;
  away_team_score: number;
  match_type: MatchType;
  round: number;
  bracket_position?: number;
  penalty_home_score?: number;
  penalty_away_score?: number;
}

export interface MatchPlayer {
  matchId: string;
  user: User;
  goals: number;
  assists: number;
  rating: number;
  position: number;
  isHome: boolean;
  penaltyScored?: boolean;
}

export interface User {
  id: string;
  nickname: string;
  goals?: number;
  assists?: number;
  rating?: number;
}

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
  FIVE_A = "FIVE_A_SIDE",
  SIX_A = "SIX_A_SIDE",
  SEVEN_A = "SEVEN_A_SIDE",
  ELEVEN_A = "ELEVEN_A_SIDE",
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

export enum ViewType {
  GRID,
  LIST,
}

export function convertMatchType(matchType: string): string {
  if (!matchType) {
    return "";
  }
  return matchType
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
}
