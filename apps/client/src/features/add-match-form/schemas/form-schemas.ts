import { createStepSchema } from "../../multi-step-form/utils";
import {
  baseMatchSchema,
  playersSchema,
  matchPlayersSchema,
  teamsSchema,
} from "./base-schemas";

export const AddDuelFormSchema = createStepSchema({
  match: baseMatchSchema,
  players: playersSchema,
  matchPlayers: matchPlayersSchema,
});

export const AddLeagueFormSchema = createStepSchema({
  match: teamsSchema.extend(baseMatchSchema.shape),
  players: playersSchema,
  matchPlayers: matchPlayersSchema,
});

export const AddKnockoutFormSchema = createStepSchema({
  match: teamsSchema.extend(baseMatchSchema.shape),
  players: playersSchema,
  matchPlayers: matchPlayersSchema,
});
