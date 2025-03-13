import { z } from "zod";
import { CompetitionType, MatchType } from ".";
import { createStepSchema } from "./utils";

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

export const createCompetitionRequestSchema = z
  .object({
    dashboardId: z.string(),
    name: z.string(),
    type: z.nativeEnum(CompetitionType),
    track_seasons: z.boolean(),
    current_season: z.coerce.number().min(1).optional(),
    min_players: z.coerce.number().min(4).optional(),
    voting_enabled: z.boolean(),
    voting_period_days: z.number().min(0).optional(),
    knockout_voting_period_days: z.number().min(0).optional(),
    reminder_days: z.number().min(0).optional(),
  })
  .refine(
    (data) =>
      !data.voting_enabled ||
      (data.voting_period_days !== undefined &&
        data.reminder_days !== undefined),
    {
      message: "Voting period and Reminder are required when voting is enabled",
      path: ["voting_period_days"],
    }
  );

export type createCompetitionRequest = z.infer<
  typeof createCompetitionRequestSchema
>;

export type AddDuelFormValues = z.infer<typeof AddDuelFormSchema>;
export type PartialAddDuelFormValues = Partial<AddDuelFormValues>;
export type DuelMatchForm = z.infer<typeof AddDuelFormSchema>["match"];
export type DuelPlayersForm = z.infer<typeof AddDuelFormSchema>["players"];
export type DuelMatchPlayersForm = z.infer<
  typeof AddDuelFormSchema
>["matchPlayers"];

export type createMatchRequest = z.infer<typeof createMatchRequestSchema>;
