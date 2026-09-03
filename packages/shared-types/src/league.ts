/** The answer to a Teams setup save (`PATCH /api/leagues/:id/team-names`). */
export interface UpdateTeamNamesResponse {
  success: boolean;
  updatedTeams: number;
  updates: { id: string; name: string }[];
  /**
   * Fixtures generated for the Current season by this save; 0 when it already
   * had a Match, so saving again generates nothing.
   */
  fixturesGenerated: number;
}

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
