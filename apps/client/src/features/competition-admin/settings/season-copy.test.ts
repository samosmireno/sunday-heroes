import { CompetitionType } from "@repo/shared-types";
import { describe, expect, it } from "vitest";
import { competitionSettings, currentSeasonResponse } from "@/test/fixtures";
import {
  START_NEW_SEASON_HELPER,
  startNewSeasonCardCopy,
  startNewSeasonDialogCopy,
} from "./season-copy";

const league = competitionSettings({
  name: "Sunday League",
  type: CompetitionType.LEAGUE,
  currentSeason: currentSeasonResponse({
    number: 3,
    matchCount: 12,
    notCompletedCount: 5,
    openVotingCount: 2,
  }),
});

const duel = competitionSettings({
  name: "Thursday Duel",
  type: CompetitionType.DUEL,
  currentSeason: currentSeasonResponse({
    number: 3,
    matchCount: 12,
    notCompletedCount: 0,
    openVotingCount: 0,
  }),
});

describe("startNewSeasonCardCopy", () => {
  it("tells a League admin the table restarts and Teams setup follows", () => {
    expect(startNewSeasonCardCopy(league)).toBe(
      "Close season 3 and start season 4. Past matches stay viewable by season. The standings table starts from zero, and you set up the teams and fixtures for season 4 next.",
    );
  });

  it("keeps only the season sentences for a Duel", () => {
    expect(startNewSeasonCardCopy(duel)).toBe(
      "Close season 3 and start season 4. Past matches stay viewable by season.",
    );
  });

  it("explains why the button waits for a match", () => {
    expect(START_NEW_SEASON_HELPER).toBe(
      "Start new season becomes available once the current season has matches.",
    );
  });
});

describe("startNewSeasonDialogCopy", () => {
  it("describes a League rollover with its fixtures, voting and standings bullets", () => {
    expect(startNewSeasonDialogCopy(league)).toEqual({
      title: "Start season 4?",
      intro:
        'Season 3 of "Sunday League" will close and season 4 will open. This cannot be undone.',
      bullets: [
        "Season 3's matches stay viewable but can no longer be edited or completed.",
        "5 fixtures are not completed. They stay in season 3 as they are.",
        "Voting is still open on 2 matches. It continues until its deadline.",
        "The standings table starts from zero. You will set up the teams and fixtures for season 4 next.",
      ],
      confirmText: "Start season 4",
      loadingText: "Starting…",
    });
  });

  it("drops the fixtures and standings bullets for a Duel and the counts at zero", () => {
    expect(startNewSeasonDialogCopy(duel).bullets).toEqual([
      "Season 3's matches stay viewable but can no longer be edited or completed.",
    ]);
  });

  it("speaks in the singular for one fixture and one match", () => {
    const one = competitionSettings({
      type: CompetitionType.LEAGUE,
      currentSeason: currentSeasonResponse({
        number: 1,
        matchCount: 3,
        notCompletedCount: 1,
        openVotingCount: 1,
      }),
    });

    expect(startNewSeasonDialogCopy(one).bullets.slice(1, 3)).toEqual([
      "1 fixture is not completed. It stays in season 1 as it is.",
      "Voting is still open on 1 match. It continues until its deadline.",
    ]);
  });
});
