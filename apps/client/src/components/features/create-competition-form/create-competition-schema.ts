import { CompetitionType, MatchType } from "@repo/logger";
import { z } from "zod";

export type CreateCompetitionFormValues = z.infer<
  typeof CreateCompetitionFormSchema
>;

export const CreateCompetitionFormSchema = z
  .object({
    name: z.string().min(1).max(30).trim(),
    type: z.nativeEnum(CompetitionType),
    track_seasons: z.boolean().default(false),
    voting_enabled: z.boolean().default(false),
    voting_period_days: z.coerce.number().min(0).nonnegative().optional(),
    reminder_days: z.coerce.number().min(0).nonnegative().optional(),
    knockout_voting_period_days: z.coerce
      .number()
      .min(0)
      .nonnegative()
      .optional(),
    is_round_robin: z.boolean().default(false).optional(),
    number_of_teams: z.coerce
      .number()
      .min(3, "Minimum 3 teams required")
      .max(16, "Maximum 16 teams allowed")
      .nonnegative()
      .optional(),
    match_type: z.nativeEnum(MatchType).optional(),
  })
  .refine(
    (data) =>
      !data.voting_enabled ||
      (data.voting_period_days !== undefined &&
        data.reminder_days !== undefined),
    {
      message: "Voting period and Reminder are required when voting is enabled",
      path: ["voting_period_days"],
    },
  )
  .refine(
    (data) =>
      data.type !== CompetitionType.LEAGUE ||
      (data.number_of_teams !== undefined && data.match_type !== undefined),
    {
      message:
        "Number of teams and match type are required for League competitions",
      path: ["number_of_teams"],
    },
  );
