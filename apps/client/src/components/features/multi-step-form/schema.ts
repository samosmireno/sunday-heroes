import { z } from "zod";
import { MatchType } from "@repo/logger";

export function createStepSchema<T extends Record<string, z.ZodType>>(
  steps: T,
) {
  return z.object(steps);
}

export const AddDuelFormSchema = createStepSchema({
  match: z.object({
    date: z.coerce.date(),
    homeTeamScore: z.coerce
      .number({
        invalid_type_error: "Required",
      })
      .min(0)
      .nonnegative(),
    awayTeamScore: z.coerce
      .number({
        invalid_type_error: "Required",
      })
      .min(0)
      .nonnegative(),
    matchType: z.nativeEnum(MatchType),
    hasPenalties: z.boolean(),
    penaltyHomeScore: z.coerce.number().min(0).nonnegative().optional(),
    penaltyAwayScore: z.coerce.number().min(0).nonnegative().optional(),
  }),
  players: z.object({
    homePlayers: z
      .array(
        z
          .string()
          .min(2, { message: "Name must be longer than two characters" }),
      )
      .min(4, { message: "Minimum of four players is required" }),
    awayPlayers: z
      .array(
        z
          .string()
          .min(2, { message: "Name must be longer than two characters" }),
      )
      .min(4, { message: "Minimum of four players is required" }),
  }),
  matchPlayers: z.object({
    players: z.array(
      z.object({
        nickname: z.string(),
        goals: z.coerce
          .number({
            invalid_type_error: "Required",
          })
          .min(0),
        assists: z.coerce
          .number({
            invalid_type_error: "Required",
          })
          .min(0),
        position: z.coerce.number().min(0),
      }),
    ),
  }),
});
