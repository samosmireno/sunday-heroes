import { z } from "zod";
import { MatchType } from ".";
import { createStepSchema } from "./utils";

export const AddDuelFormSchema = createStepSchema({
  match: z.object({
    date: z.coerce.date().optional(),
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
          .min(2, { message: "Name must be longer than two characters" })
      )
      .min(4, { message: "Minimum of four players is required" }),
    awayPlayers: z
      .array(
        z
          .string()
          .min(2, { message: "Name must be longer than two characters" })
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
      })
    ),
  }),
});

export const createMatchRequestSchema = z.object({
  competitionId: z.string(),
  date: z.coerce.date().optional(),
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

export type AddDuelFormValues = z.infer<typeof AddDuelFormSchema>;
export type PartialAddDuelFormValues = Partial<AddDuelFormValues>;
export type DuelMatchForm = z.infer<typeof AddDuelFormSchema>["match"];
export type DuelPlayersForm = z.infer<typeof AddDuelFormSchema>["players"];
export type DuelMatchPlayersForm = z.infer<
  typeof AddDuelFormSchema
>["matchPlayers"];

export type createMatchRequest = z.infer<typeof createMatchRequestSchema>;
export type matchPlayersMatchRequest = createMatchRequest["players"];
