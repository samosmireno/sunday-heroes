import { z } from "zod";
import { CompetitionType, MatchType } from "@repo/logger";
import { createStepSchema } from "../multi-step-form/utils";

const baseMatchSchema = z.object({
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
});

const playersSchema = z.object({
  homePlayers: z
    .array(
      z.string().min(2, { message: "Name must be longer than two characters" }),
    )
    .min(4, { message: "Minimum of four players is required" }),
  awayPlayers: z
    .array(
      z.string().min(2, { message: "Name must be longer than two characters" }),
    )
    .min(4, { message: "Minimum of four players is required" }),
});

const matchPlayersSchema = z.object({
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
});

const teamsSchema = z.object({
  homeTeam: z.string().min(1, "Home team name is required"),
  awayTeam: z.string().min(1, "Away team name is required"),
});

export const AddDuelFormSchema = createStepSchema({
  match: baseMatchSchema,
  players: playersSchema,
  matchPlayers: matchPlayersSchema,
});

export const AddLeagueFormSchema = createStepSchema({
  match: teamsSchema.extend(baseMatchSchema.shape),
  players: playersSchema,
  matchPlayers: matchPlayersSchema,
});

export const AddKnockoutFormSchema = createStepSchema({
  match: teamsSchema.extend(baseMatchSchema.shape),
  players: playersSchema,
  matchPlayers: matchPlayersSchema,
});

export const createMatchFormSchema = (competitionType: CompetitionType) => {
  switch (competitionType) {
    case CompetitionType.DUEL:
      return AddDuelFormSchema;
    case CompetitionType.LEAGUE:
      return AddLeagueFormSchema;
    case CompetitionType.KNOCKOUT:
      return AddKnockoutFormSchema;
    default:
      throw new Error(`Unsupported competition type: ${competitionType}`);
  }
};

export type DuelFormData = z.infer<typeof AddDuelFormSchema>;
export type LeagueFormData = z.infer<typeof AddLeagueFormSchema>;
export type KnockoutFormData = z.infer<typeof AddKnockoutFormSchema>;

export type MatchFormData = DuelFormData | LeagueFormData | KnockoutFormData;
