export const VALIDATION_CONFIG = {
  MIN_PLAYERS_PER_TEAM: 4,
  MIN_NAME_LENGTH: 2,
  MIN_SCORE: 0,
} as const;

export const ERROR_MESSAGES = {
  NAME_TOO_SHORT: "Name must be longer than two characters",
  MIN_PLAYERS_REQUIRED: "Minimum of four players is required",
  HOME_TEAM_REQUIRED: "Home team name is required",
  AWAY_TEAM_REQUIRED: "Away team name is required",
  STATS_EXCEED_TOTALS: "Player stats cannot exceed team totals",
  SCORE_REQUIRED: "Required",
} as const;
