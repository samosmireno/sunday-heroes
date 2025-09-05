import { z } from "zod";
import { MatchType } from "./enums";

export const createMatchRequestSchema = z.object({
  competitionId: z.string(),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .optional(),
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
  round: z.coerce.number().min(0).nonnegative(),
  bracketPosition: z.coerce.number().min(0).nonnegative().optional(),
  penaltyHomeScore: z.coerce.number().min(0).nonnegative().optional(),
  penaltyAwayScore: z.coerce.number().min(0).nonnegative().optional(),
  teams: z.array(z.string()),
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
      isHome: z.boolean(),
    })
  ),
});

export type createMatchRequest = z.infer<typeof createMatchRequestSchema>;
export type matchPlayersMatchRequest = createMatchRequest["players"];
