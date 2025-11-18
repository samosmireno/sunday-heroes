export type PlayerResponse = {
  id: string;
  nickname: string;
  isHome: boolean;
  goals: number;
  assists: number;
  position: number;
  rating: number;
  manOfTheMatch: boolean;
  penaltyScored?: boolean;
};

export type PlayerTotals = {
  id: string;
  nickname: string;
  matches: number;
  wins: number;
  winRate: number;
  goals: number;
  assists: number;
  penaltyScored?: number;
  rating?: number;
  numManOfTheMatch?: number;
};

export interface LeaguePlayerTotals extends PlayerTotals {
  teamName: string;
}

export type DuelPlayerRequest = {
  nickname: string;
  isHome: boolean;
  goals: number;
  assists: number;
  position: number;
  penaltyScored?: boolean;
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

export type OrderStatsByOption = "goals" | "assists" | "rating" | "matches";
