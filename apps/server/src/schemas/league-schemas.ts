import { MatchType } from "@prisma/client";
import { createCompetitionRequestSchema } from "./create-competition-request-schema";
import z from "zod";

export const createLeagueRequestSchema = createCompetitionRequestSchema
  .innerType()
  .extend({
    matchType: z.nativeEnum(MatchType),
    numberOfTeams: z.coerce
      .number()
      .min(2, "Number of teams must be at least 2"),
    teamNames: z
      .array(z.string().min(1, "Team name cannot be empty"))
      .min(2, "At least 2 team names are required")
      .optional(),
    isRoundRobin: z.boolean().optional(),
  });

export const addTeamSchema = z.object({
  teamName: z.string().min(1, "Team name is required"),
});

export type CreateLeagueRequest = z.infer<typeof createLeagueRequestSchema>;
