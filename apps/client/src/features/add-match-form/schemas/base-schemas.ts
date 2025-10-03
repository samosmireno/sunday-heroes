import { z } from "zod";
import { MatchType } from "@repo/shared-types";
import { VALIDATION_CONFIG, ERROR_MESSAGES } from "./constants";

export const baseMatchSchema = z.object({
  date: z.coerce.date().optional(),
  homeTeamScore: z.coerce
    .number({
      invalid_type_error: ERROR_MESSAGES.SCORE_REQUIRED,
    })
    .min(VALIDATION_CONFIG.MIN_SCORE),
  awayTeamScore: z.coerce
    .number({
      invalid_type_error: ERROR_MESSAGES.SCORE_REQUIRED,
    })
    .min(VALIDATION_CONFIG.MIN_SCORE),
  matchType: z.nativeEnum(MatchType),
  hasPenalties: z.boolean().default(false),
  penaltyHomeScore: z.coerce
    .number()
    .min(VALIDATION_CONFIG.MIN_SCORE)
    .optional(),
  penaltyAwayScore: z.coerce
    .number()
    .min(VALIDATION_CONFIG.MIN_SCORE)
    .optional(),
  videoUrl: z.string().optional(),
});

export const playersSchema = z.object({
  homePlayers: z
    .array(
      z.string().min(VALIDATION_CONFIG.MIN_NAME_LENGTH, {
        message: ERROR_MESSAGES.NAME_TOO_SHORT,
      }),
    )
    .min(VALIDATION_CONFIG.MIN_PLAYERS_PER_TEAM, {
      message: ERROR_MESSAGES.MIN_PLAYERS_REQUIRED,
    }),
  awayPlayers: z
    .array(
      z.string().min(VALIDATION_CONFIG.MIN_NAME_LENGTH, {
        message: ERROR_MESSAGES.NAME_TOO_SHORT,
      }),
    )
    .min(VALIDATION_CONFIG.MIN_PLAYERS_PER_TEAM, {
      message: ERROR_MESSAGES.MIN_PLAYERS_REQUIRED,
    }),
});

export const matchPlayersSchema = z.object({
  players: z.array(
    z.object({
      nickname: z.string(),
      goals: z.coerce
        .number({
          invalid_type_error: ERROR_MESSAGES.SCORE_REQUIRED,
        })
        .min(VALIDATION_CONFIG.MIN_SCORE)
        .default(0),
      assists: z.coerce
        .number({
          invalid_type_error: ERROR_MESSAGES.SCORE_REQUIRED,
        })
        .min(VALIDATION_CONFIG.MIN_SCORE)
        .default(0),
      position: z.coerce.number().min(0),
    }),
  ),
});

export const teamsSchema = z.object({
  homeTeam: z
    .string()
    .min(VALIDATION_CONFIG.MIN_NAME_LENGTH, ERROR_MESSAGES.HOME_TEAM_REQUIRED),
  awayTeam: z
    .string()
    .min(VALIDATION_CONFIG.MIN_NAME_LENGTH, ERROR_MESSAGES.AWAY_TEAM_REQUIRED),
});
