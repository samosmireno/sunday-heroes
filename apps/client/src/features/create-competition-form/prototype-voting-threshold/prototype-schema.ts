/**
 * PROTOTYPE — throwaway. Issue #38.
 *
 * A copy of CreateCompetitionFormSchema with `votingThreshold` added, so the
 * variants can be judged against the real form's validation behaviour without
 * touching the real schema. Bounds here are deliberately loose — each variant
 * argues for its own bounds in its own UI, and that disagreement is the point.
 */
import { CompetitionType, MatchType } from "@repo/shared-types";
import { z } from "zod";

export const PrototypeFormSchema = z
  .object({
    name: z.string().min(1).max(30).trim(),
    type: z.nativeEnum(CompetitionType),
    votingEnabled: z.boolean().default(false),
    votingPeriodDays: z.coerce.number().min(0).nonnegative().optional(),
    reminderDays: z.coerce.number().min(0).nonnegative().optional(),
    knockoutVotingPeriodDays: z.coerce.number().min(0).nonnegative().optional(),
    // An empty field means *no threshold*, so it has to pass validation.
    // `z.coerce.number()` alone turns "" into 0 and trips min(1).
    votingThreshold: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.coerce.number().int().min(1).max(50).optional(),
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
  .refine((data) => !data.votingEnabled || data.votingPeriodDays !== undefined, {
    message: "Voting period is required when voting is enabled",
    path: ["votingPeriodDays"],
  })
  .refine((data) => !data.votingEnabled || data.reminderDays !== undefined, {
    message: "Reminder days is required when voting is enabled",
    path: ["reminderDays"],
  })
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

export type PrototypeFormValues = z.infer<typeof PrototypeFormSchema>;

/** The threshold as a usable number, or null while the field is empty/invalid. */
export function readThreshold(value: unknown): number | null {
  const n = Number(value);
  if (value === "" || value === null || value === undefined) return null;
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : null;
}
