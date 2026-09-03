import { CompetitionSettings, CompetitionType } from "@repo/shared-types";

/** What the Season card and its dialog need to describe a Start new season. */
type StartNewSeasonInput = Pick<
  CompetitionSettings,
  "name" | "type" | "currentSeason"
>;

export const START_NEW_SEASON_HELPER =
  "Start new season becomes available once the current season has matches.";

const plural = (count: number, singular: string, pluralForm: string) =>
  count === 1 ? singular : pluralForm;

/** The Season card's paragraph; the standings sentence is League only. */
export function startNewSeasonCardCopy({
  type,
  currentSeason,
}: StartNewSeasonInput): string {
  const closing = currentSeason.number;
  const opening = closing + 1;

  const sentences = [
    `Close season ${closing} and start season ${opening}. Past matches stay viewable by season.`,
  ];
  if (type === CompetitionType.LEAGUE) {
    sentences.push(
      `The standings table starts from zero, and you set up the teams and fixtures for season ${opening} next.`,
    );
  }

  return sentences.join(" ");
}

export interface StartNewSeasonDialogCopy {
  title: string;
  intro: string;
  bullets: string[];
  confirmText: string;
  loadingText: string;
}

/** The confirmation dialog; counts appear only when above zero. */
export function startNewSeasonDialogCopy({
  name,
  type,
  currentSeason,
}: StartNewSeasonInput): StartNewSeasonDialogCopy {
  const closing = currentSeason.number;
  const opening = closing + 1;
  const isLeague = type === CompetitionType.LEAGUE;
  const { notCompletedCount, openVotingCount } = currentSeason;

  const bullets = [
    `Season ${closing}'s matches stay viewable but can no longer be edited or completed.`,
  ];
  if (isLeague && notCompletedCount > 0) {
    bullets.push(
      notCompletedCount === 1
        ? `1 fixture is not completed. It stays in season ${closing} as it is.`
        : `${notCompletedCount} fixtures are not completed. They stay in season ${closing} as they are.`,
    );
  }
  if (openVotingCount > 0) {
    bullets.push(
      `Voting is still open on ${openVotingCount} ${plural(openVotingCount, "match", "matches")}. It continues until its deadline.`,
    );
  }
  if (isLeague) {
    bullets.push(
      `The standings table starts from zero. You will set up the teams and fixtures for season ${opening} next.`,
    );
  }

  return {
    title: `Start season ${opening}?`,
    intro: `Season ${closing} of "${name}" will close and season ${opening} will open. This cannot be undone.`,
    bullets,
    confirmText: `Start season ${opening}`,
    loadingText: "Starting…",
  };
}
