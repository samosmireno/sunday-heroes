import { MatchType } from "@prisma/client";
import { createCompetitionRequestSchema } from "./create-competition-request-schema";
import z from "zod";

export const createLeagueRequestSchema = createCompetitionRequestSchema
  .innerType()
  .extend({
    match_type: z.nativeEnum(MatchType),
    number_of_teams: z.coerce
      .number()
      .min(2, "Number of teams must be at least 2"),
    team_names: z
      .array(z.string().min(1, "Team name cannot be empty"))
      .min(2, "At least 2 team names are required")
      .optional(),
    is_round_robin: z.boolean().optional(),
  });

export const addTeamSchema = z.object({
  teamName: z.string().min(1, "Team name is required"),
});

export type CreateLeagueRequest = z.infer<typeof createLeagueRequestSchema>;
