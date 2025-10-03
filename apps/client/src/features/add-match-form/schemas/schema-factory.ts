import { CompetitionType } from "@repo/shared-types";
import {
  AddDuelFormSchema,
  AddLeagueFormSchema,
  AddKnockoutFormSchema,
} from "./form-schemas";
import { createTeamStatsValidation } from "./validation";

export const createMatchFormSchema = (competitionType: CompetitionType) => {
  switch (competitionType) {
    case CompetitionType.DUEL:
      return createTeamStatsValidation(AddDuelFormSchema);
    case CompetitionType.LEAGUE:
      return createTeamStatsValidation(AddLeagueFormSchema);
    case CompetitionType.KNOCKOUT:
      return createTeamStatsValidation(AddKnockoutFormSchema);
    default:
      throw new Error(`Unsupported competition type: ${competitionType}`);
  }
};
