import { CompetitionType } from "@repo/shared-types";
import { z } from "zod";

export const createCompetitionRequestSchema = z
  .object({
    userId: z.string(),
    name: z.string(),
    type: z.nativeEnum(CompetitionType),
    trackSeasons: z.boolean(),
    currentSeason: z.coerce.number().min(1).optional(),
    minPlayers: z.coerce.number().min(4).optional(),
    votingEnabled: z.boolean(),
    votingPeriodDays: z.coerce.number().optional(),
    knockoutVotingPeriodDays: z.coerce.number().optional(),
    reminderDays: z.coerce.number().optional(),
  })
  .refine(
    (data) =>
      !data.votingEnabled ||
      (data.votingPeriodDays !== undefined && data.reminderDays !== undefined),
    {
      message: "Voting period and Reminder are required when voting is enabled",
      path: ["voting_period_days"],
    }
  )
  .refine(
    (data) =>
      data.reminderDays === undefined ||
      data.votingPeriodDays === undefined ||
      data.reminderDays < data.votingPeriodDays,
    {
      message: "Reminder days must be less than voting period days",
      path: ["reminderDays", "votingPeriodDays"],
    }
  );

export type createCompetitionRequest = z.infer<
  typeof createCompetitionRequestSchema
>;
