import { CompetitionSettings, CompetitionType } from "@repo/shared-types";

/** What the Reset card and its dialog need to describe a Reset competition. */
type ResetInput = Pick<CompetitionSettings, "name" | "type" | "seasons">;

export const RESET_HELPER = "There are no matches to reset.";

/** How many Seasons a Reset deletes, and how many Matches across them. */
export function resetCounts({ seasons }: Pick<CompetitionSettings, "seasons">) {
  return {
    seasons: seasons.length,
    matches: seasons.reduce((sum, season) => sum + season.matchCount, 0),
  };
}

/** The Danger Zone paragraph; teams and Teams setup are League only. */
export function resetCompetitionCardCopy({
  type,
  seasons,
}: ResetInput): string {
  const { seasons: seasonCount } = resetCounts({ seasons });

  const sentences = [
    seasonCount === 1
      ? "Delete every match and start season 1 again."
      : `Delete every match from all ${seasonCount} seasons and start again from season 1.`,
  ];
  if (type === CompetitionType.LEAGUE) {
    sentences.push(
      "Teams, moderators and settings stay. You set up the teams and fixtures for season 1 next.",
    );
  } else {
    sentences.push("Moderators and settings stay.");
  }

  return sentences.join(" ");
}

export interface ResetCompetitionDialogCopy {
  title: string;
  intro: string;
  bullets: string[];
  confirmText: string;
  loadingText: string;
}

/** The confirmation dialog; the seasons clause appears only beyond one Season. */
export function resetCompetitionDialogCopy({
  name,
  type,
  seasons,
}: ResetInput): ResetCompetitionDialogCopy {
  const counts = resetCounts({ seasons });

  const subject =
    counts.matches === 1
      ? `The only match of "${name}"`
      : `All ${counts.matches} matches of "${name}"`;
  const across =
    counts.seasons === 1 ? "" : `, across ${counts.seasons} seasons,`;

  const bullets = [
    "Results, player stats and votes from every season are deleted.",
  ];
  if (type === CompetitionType.LEAGUE) {
    bullets.push(
      "The standings table starts from zero. You will set up the teams and fixtures for season 1 next.",
    );
  }
  bullets.push(
    "Players who have no account and no other matches on this dashboard are removed.",
    "Moderators and competition settings stay.",
  );

  return {
    title: `Reset "${name}"?`,
    intro: `${subject}${across} will be deleted and season 1 will start again today. This cannot be undone.`,
    bullets,
    confirmText: "Reset competition",
    loadingText: "Resetting…",
  };
}
