import { DashboardMatchResponse } from "./match";
import { DashboardCompetitionResponse } from "./competition";

export type DashboardResponse = {
  activeCompetitions: number;
  totalPlayers: number;
  pendingVotes: number;
  completedMatches: number;
  matches: DashboardMatchResponse[];
  competitions: DashboardCompetitionResponse[];
};
