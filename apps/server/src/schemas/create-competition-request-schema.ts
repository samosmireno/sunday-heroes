import { MatchType } from "@prisma/client";
import { CompetitionType } from "@repo/shared-types";
import { z } from "zod";

/** The fields every create route shares; `createLeagueRequestSchema` adds a League's. */
export const createCompetitionRequestSchema = z
  .object({
    userId: z.string(),
    name: z.string(),
    type: z.nativeEnum(CompetitionType),
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
    },
  )
  .refine(
    (data) =>
      data.reminderDays === undefined ||
      data.votingPeriodDays === undefined ||
      data.reminderDays < data.votingPeriodDays,
    {
      message: "Reminder days must be less than voting period days",
      path: ["reminderDays", "votingPeriodDays"],
    },
  );

/**
 * What `POST /api/competitions` accepts: a Duel or a Knockout. A League is
 * created only through `POST /api/leagues`, which requires its match type and
 * teams; accepted here it would have neither, and Teams setup could never
 * generate its Fixtures (ADR 0001).
 */
export const createNonLeagueCompetitionRequestSchema =
  createCompetitionRequestSchema.refine(
    (data) => data.type !== CompetitionType.LEAGUE,
    {
      message: "Leagues are created through POST /api/leagues",
      path: ["type"],
    },
  );

export type createCompetitionRequest = z.infer<
  typeof createCompetitionRequestSchema
>;

/** What competition creation consumes: the request, plus a League's format. */
export type CreateCompetitionInput = createCompetitionRequest & {
  isRoundRobin?: boolean;
  matchType?: MatchType;
};
