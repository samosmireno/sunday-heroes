/**
 * The name League creation gives its `n`-th team (1-based) before Teams setup.
 * The server writes it; the client recognises it with `isPlaceholderTeamName`,
 * so the two stay in step.
 */
export function placeholderTeamName(n: number): string {
  return `Team ${n}`;
}

const PLACEHOLDER_TEAM_NAME_PATTERNS = [
  /^Team \d+$/i,
  // Legacy, from before the `Team N` template. Drop once production is
  // checked for names of this shape.
  /^team-\d+$/i,
];

/**
 * Whether a team still carries the name League creation gave it, rather than
 * one an admin chose in Teams setup.
 */
export function isPlaceholderTeamName(name: string): boolean {
  return PLACEHOLDER_TEAM_NAME_PATTERNS.some((pattern) => pattern.test(name));
}

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
