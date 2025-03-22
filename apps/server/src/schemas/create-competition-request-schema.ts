import { CompetitionType } from "@repo/logger";
import { z } from "zod";

export const createCompetitionRequestSchema = z
  .object({
    userId: z.string(),
    name: z.string(),
    type: z.nativeEnum(CompetitionType),
    track_seasons: z.boolean(),
    current_season: z.coerce.number().min(1).optional(),
    min_players: z.coerce.number().min(4).optional(),
    voting_enabled: z.boolean(),
    voting_period_days: z.coerce.number().optional(),
    knockout_voting_period_days: z.coerce.number().optional(),
    reminder_days: z.coerce.number().optional(),
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
