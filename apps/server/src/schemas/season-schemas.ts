import { Request } from "express";
import { SeasonFilter } from "@repo/shared-types";
import { z } from "zod";
import { parseQuery } from "../utils/request-utils";

/** A season selection: one Season by number, "all", or absent for the Current season. */
export type SeasonQuery = SeasonFilter | undefined;

/**
 * The season filter contract: `season=<n>` selects one Season, `season=all`
 * every Season, and an absent value means the Current season.
 */
export const seasonQuerySchema: z.ZodType<SeasonQuery, z.ZodTypeDef, unknown> =
  z
    .union([
      z.literal("all"),
      z
        .string()
        .regex(/^[1-9]\d*$/, "season must be a positive whole number or 'all'")
        .transform(Number),
    ])
    .optional();

const seasonQueryObjectSchema = z.object({ season: seasonQuerySchema });

/** The `season` query value of a request, parsed in the handler. */
export const getSeasonQuery = (req: Request): SeasonQuery =>
  parseQuery(seasonQueryObjectSchema, req.query).season;

/** The paginated All Matches read: a season only makes sense within a Competition. */
export const matchesQuerySchema = z
  .object({
    userId: z.string().min(1),
    competitionId: z.string().min(1).optional(),
    season: seasonQuerySchema,
  })
  .refine(
    (query) => query.season === undefined || query.competitionId !== undefined,
    { message: "season requires competitionId", path: ["season"] },
  );

export type MatchesQuery = z.infer<typeof matchesQuerySchema>;
