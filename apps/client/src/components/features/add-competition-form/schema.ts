import { CompetitionType } from "@repo/logger";
import { z } from "zod";

export const CreateCompetitionFormSchema = z
  .object({
    name: z.string(),
    type: z.nativeEnum(CompetitionType),
    track_season: z.boolean().default(false),
    voting_enabled: z.boolean().default(false),
    voting_period_days: z.coerce.number().min(0).nonnegative().optional(),
    reminder_days: z.coerce.number().min(0).nonnegative().optional(),
    knockout_voting_period_days: z.coerce
      .number()
      .min(0)
      .nonnegative()
      .optional(),
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
  );
