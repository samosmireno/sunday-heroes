import { CompetitionType, MatchType, VotingStatus } from "./enums";

export type DashboardResponse = {
  activeCompetitions: number;
  totalPlayers: number;
  pendingVotes: number;
  completedMatches: number;
  matches: DashboardMatchResponse[];
  competitions: DashboardCompetitionResponse[];
  votingEnabled: boolean;
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
