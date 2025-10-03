import { z } from "zod";
import { playersSchema, matchPlayersSchema } from "./base-schemas";
import {
  AddDuelFormSchema,
  AddLeagueFormSchema,
  AddKnockoutFormSchema,
} from "./form-schemas";

// Base types
export type CompetitionPlayersData = z.infer<typeof playersSchema>;
export type MatchPlayersData = z.infer<typeof matchPlayersSchema>;

// Form data types
export type DuelFormData = z.infer<typeof AddDuelFormSchema>;
export type PartialDuelFormData = Partial<DuelFormData>;
export type LeagueFormData = z.infer<typeof AddLeagueFormSchema>;
export type KnockoutFormData = z.infer<typeof AddKnockoutFormSchema>;

// Union types
export type MatchFormData = DuelFormData | LeagueFormData | KnockoutFormData;
export type MatchSchema =
  | typeof AddDuelFormSchema
  | typeof AddLeagueFormSchema
  | typeof AddKnockoutFormSchema;
