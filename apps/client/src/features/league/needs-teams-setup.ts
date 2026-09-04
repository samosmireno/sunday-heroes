import {
  CompetitionType,
  isPlaceholderTeamName,
  Role,
  SeasonResponse,
} from "@repo/shared-types";
import { currentSeasonOf } from "@/features/competition/use-season-param";

type Team = { id: string; name: string };

function hasCustomTeamNames(teams: Team[]): boolean {
  return teams.some((team) => !isPlaceholderTeamName(team.name));
}

/**
 * The League router's gate. Teams setup is an admin step, taken once per
 * Season: it is shown to an admin or moderator while the team names are still
 * placeholders or the Current season has no Fixtures yet. Everyone else, the
 * anonymous visitor on the public route included, sees the League page.
 */
export function needsTeamsSetup(input: {
  type: CompetitionType;
  userRole: Role;
  /** Ascending by number; the Current season is the one not ended. */
  seasons: SeasonResponse[];
  teams: Team[];
}): boolean {
  if (input.type === CompetitionType.DUEL) {
    return false;
  }
  if (input.userRole !== Role.ADMIN && input.userRole !== Role.MODERATOR) {
    return false;
  }

  const currentSeason = currentSeasonOf(input.seasons);
  const currentSeasonIsEmpty = currentSeason?.matchCount === 0;

  return !hasCustomTeamNames(input.teams) || currentSeasonIsEmpty;
}
