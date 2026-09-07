import { CompetitionType, MatchType } from "@repo/shared-types";
import { z } from "zod";

export type CreateCompetitionFormValues = z.infer<
  typeof CreateCompetitionFormSchema
>;

/**
 * The Voting threshold's bounds, shared by the schema and the input that
 * collects it so the two cannot drift apart. The server states the same pair in
 * `create-competition-request-schema.ts` and is the one that enforces it.
 */
export const VOTING_THRESHOLD_MIN = 1;
export const VOTING_THRESHOLD_MAX = 50;

export const CreateCompetitionFormSchema = z
  .object({
    name: z.string().min(1).max(30).trim(),
    type: z.nativeEnum(CompetitionType),
    votingEnabled: z.boolean().default(false),
    votingPeriodDays: z.coerce.number().min(0).nonnegative().optional(),
    reminderDays: z.coerce.number().min(0).nonnegative().optional(),
    knockoutVotingPeriodDays: z.coerce.number().min(0).nonnegative().optional(),
    // Optional, and empty by default. `preprocess` first: a bare
    // `z.coerce.number()` reads the empty input as 0, which trips `min(1)` and
    // would disable the submit button with no message anyone can see.
    votingThreshold: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.coerce
        .number()
        .int()
        .min(VOTING_THRESHOLD_MIN)
        .max(VOTING_THRESHOLD_MAX)
        .optional(),
    ),
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
    (data) => !data.votingEnabled || data.votingPeriodDays !== undefined,
    {
      message: "Voting period is required when voting is enabled",
      path: ["votingPeriodDays"],
    },
  )
  .refine((data) => !data.votingEnabled || data.reminderDays !== undefined, {
    message: "Reminder days is required when voting is enabled",
    path: ["reminderDays"],
  })
  .refine(
    (data) =>
      data.type !== CompetitionType.LEAGUE || data.numberOfTeams !== undefined,
    {
      message: "Number of teams is required for League competitions",
      path: ["numberOfTeams"],
    },
  )
  .refine(
    (data) =>
      data.type !== CompetitionType.LEAGUE || data.matchType !== undefined,
    {
      message: "Match type is required for League competitions",
      path: ["matchType"],
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
