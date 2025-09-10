import { CompetitionType, MatchType } from "@repo/shared-types";
import { z } from "zod";

export type CreateCompetitionFormValues = z.infer<
  typeof CreateCompetitionFormSchema
>;

export const CreateCompetitionFormSchema = z
  .object({
    name: z.string().min(1).max(30).trim(),
    type: z.nativeEnum(CompetitionType),
    trackSeasons: z.boolean().default(false),
    votingEnabled: z.boolean().default(false),
    votingPeriodDays: z.coerce.number().min(0).nonnegative().optional(),
    reminderDays: z.coerce.number().min(0).nonnegative().optional(),
    knockoutVotingPeriodDays: z.coerce.number().min(0).nonnegative().optional(),
    isRoundRobin: z.boolean().default(false).optional(),
    numberOfTeams: z.coerce
      .number()
      .min(3, "Minimum 3 teams required")
      .max(16, "Maximum 16 teams allowed")
      .nonnegative()
      .optional(),
    matchType: z.nativeEnum(MatchType).optional(),
  })
  .refine(
    (data) =>
      !data.votingEnabled ||
      (data.votingPeriodDays !== undefined && data.reminderDays !== undefined),
    {
      message: "Voting period and Reminder are required when voting is enabled",
      path: ["reminderDays"],
    },
  )
  .refine(
    (data) =>
      data.type !== CompetitionType.LEAGUE ||
      (data.numberOfTeams !== undefined && data.matchType !== undefined),
    {
      message:
        "Number of teams and match type are required for League competitions",
      path: ["numberOfTeams"],
    },
  )
  .refine(
    (data) =>
      data.reminderDays === undefined ||
      data.votingPeriodDays === undefined ||
      data.reminderDays < data.votingPeriodDays,
    {
      message: "Reminder days must be less than voting period days",
      path: ["reminderDays"],
    },
  );
