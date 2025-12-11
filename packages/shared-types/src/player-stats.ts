import { CompetitionType } from "./enums";

interface PlayerStatsOverview {
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

interface TopMatchResponse {
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

interface TopMatchesResponse {
  topGoals: TopMatchResponse | null;
  topAssists: TopMatchResponse | null;
  topRating: TopMatchResponse | null;
}

interface TopCompetitionResponse {
  competitionId: string;
  name: string;
  type: CompetitionType;
  goals: number;
  assists: number;
  avgRating: number;
  matchCount: number;
}

interface TopCompetitionsResponse {
  topGoals: TopCompetitionResponse | null;
  topAssists: TopCompetitionResponse | null;
  topRating: TopCompetitionResponse | null;
}

interface PerformanceDataPoint {
  matchId: string;
  date: string;
  opponent: string;
  competitionName: string;
  result: "W" | "D" | "L";
  goals: number;
  assists: number;
  rating: number;
}

interface PerformanceChartResponse {
  matches: PerformanceDataPoint[];
  summary: {
    totalGoals: number;
    totalAssists: number;
    avgRating: number;
    goalsPerMatch: number;
    assistsPerMatch: number;
    matchCount: number;
  };
  range: number | "all";
  competitionId?: string;
}

interface TeammateStats {
  dashboardPlayerId: string;
  nickname: string;
  userId: string | null;
  isRegistered: boolean;
  matchesTogether: number;
  record: {
    wins: number;
    draws: number;
    losses: number;
  };
  winRate: number;
}

interface TopTeammatesResponse {
  teammates: TeammateStats[];
}

interface CompetitionStats {
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

interface CompetitionBreakdownResponse {
  competitions: CompetitionStats[];
  sortBy: "goals" | "assists" | "rating" | "matches";
}
