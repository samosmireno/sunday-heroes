import { CompetitionType } from "./enums";

export interface PlayerStatsOverview {
  player: {
    id: string;
    nickname: string;
    userId: string | null;
    isRegistered: boolean;
  };

  careerStats: {
    totalMatches: number;
    totalGoals: number;
    totalAssists: number;
    avgRating: number;
    totalCompetitions: number;
    record: {
      wins: number;
      draws: number;
      losses: number;
    };
    manOfTheMatchCount: number;
  };

  recentForm: Array<{
    matchId: string;
    result: "W" | "D" | "L";
    goals: number;
    assists: number;
    rating: number;
    opponent: string;
    score: string;
    date: string;
    competitionName: string;
  }>;
}

export interface TopMatchResponse {
  matchId: string;
  opponent: string;
  competition: {
    id: string;
    name: string;
    type: CompetitionType;
    round?: string;
  };
  date: string;
  result: "W" | "D" | "L";
  score: {
    playerTeam: number;
    opponent: number;
  };
  goals: number;
  assists: number;
  rating: number;
}

export interface TopMatchesResponse {
  topGoals: TopMatchResponse | null;
  topAssists: TopMatchResponse | null;
  topRating: TopMatchResponse | null;
}

export interface AggregateCompetition {
  competitionId: string;
  competitionName: string;
  competitionType: CompetitionType;
  totalGoals: number;
  totalAssists: number;
  avgRating: number;
  matchCount: number;
}

export interface TopCompetitionsResponse {
  topGoals: AggregateCompetition | null;
  topAssists: AggregateCompetition | null;
  topRating: AggregateCompetition | null;
}

export interface PerformanceDataPoint {
  matchId: string;
  date: string;
  opponent: string;
  competitionName: string;
  result: "W" | "D" | "L";
  goals: number;
  assists: number;
  rating: number;
}

export interface PerformanceChartResponse {
  matches: PerformanceDataPoint[];
  competitionId: string;
  range?: number;
}

export interface TeammateStats {
  dashboardPlayerId: string;
  nickname: string;
  isRegistered: boolean;
  matchesTogether: number;
  record: {
    wins: number;
    draws: number;
    losses: number;
  };
  winRate: number;
}

export interface PlayerCompetitionStats {
  competitionId: string;
  name: string;
  type: CompetitionType;
  matches: number;
  record: {
    wins: number;
    draws: number;
    losses: number;
  };
  goals: number;
  assists: number;
  avgRating: number;
  goalsPerMatch: number;
  assistsPerMatch: number;
}
