import { CompetitionType } from "@repo/shared-types";
import { describe, expect, it } from "vitest";
import {
  competitionSettings,
  seasonResponse,
  threeSeasons,
} from "@/test/fixtures";
import {
  resetCompetitionCardCopy,
  resetCompetitionDialogCopy,
  resetCounts,
} from "./reset-copy";

const league = competitionSettings({
  name: "Sunday League",
  type: CompetitionType.LEAGUE,
  seasons: threeSeasons,
});

const duel = competitionSettings({
  name: "Thursday Duel",
  type: CompetitionType.DUEL,
  seasons: threeSeasons,
});

const oneSeasonLeague = competitionSettings({
  name: "Sunday League",
  type: CompetitionType.LEAGUE,
  seasons: [seasonResponse({ number: 1, matchCount: 6 })],
});

describe("resetCounts", () => {
  it("counts the seasons and sums their matches", () => {
    expect(resetCounts(league)).toEqual({ seasons: 3, matches: 42 });
  });

  it("is zero for a Competition whose only Season is empty", () => {
    expect(
      resetCounts(competitionSettings({ seasons: [seasonResponse()] })),
    ).toEqual({ seasons: 1, matches: 0 });
  });
});

describe("resetCompetitionCardCopy", () => {
  it("tells a League admin with several seasons that the teams stay and Teams setup follows", () => {
    expect(resetCompetitionCardCopy(league)).toBe(
      "Delete every match from all 3 seasons and start again from season 1. Teams, moderators and settings stay. You set up the teams and fixtures for season 1 next.",
    );
  });

  it("keeps only the moderators and settings sentence for a Duel", () => {
    expect(resetCompetitionCardCopy(duel)).toBe(
      "Delete every match from all 3 seasons and start again from season 1. Moderators and settings stay.",
    );
  });

  it("speaks of season 1 alone when there is only one", () => {
    expect(resetCompetitionCardCopy(oneSeasonLeague)).toBe(
      "Delete every match and start season 1 again. Teams, moderators and settings stay. You set up the teams and fixtures for season 1 next.",
    );
  });
});

describe("resetCompetitionDialogCopy", () => {
  it("describes a League reset with its counts, the standings bullet and the player prune", () => {
    expect(resetCompetitionDialogCopy(league)).toEqual({
      title: 'Reset "Sunday League"?',
      intro:
        'All 42 matches of "Sunday League", across 3 seasons, will be deleted and season 1 will start again today. This cannot be undone.',
      bullets: [
        "Results, player stats and votes from every season are deleted.",
        "The standings table starts from zero. You will set up the teams and fixtures for season 1 next.",
        "Players who have no account and no other matches on this dashboard are removed.",
        "Moderators and competition settings stay.",
      ],
      confirmText: "Reset competition",
      loadingText: "Resetting…",
    });
  });

  it("drops the standings bullet for a Duel", () => {
    expect(resetCompetitionDialogCopy(duel).bullets).toEqual([
      "Results, player stats and votes from every season are deleted.",
      "Players who have no account and no other matches on this dashboard are removed.",
      "Moderators and competition settings stay.",
    ]);
  });

  it("loses the seasons clause when there is only one season", () => {
    expect(resetCompetitionDialogCopy(oneSeasonLeague).intro).toBe(
      'All 6 matches of "Sunday League" will be deleted and season 1 will start again today. This cannot be undone.',
    );
  });

  it("speaks in the singular for one match", () => {
    const oneMatch = competitionSettings({
      name: "Sunday League",
      seasons: [seasonResponse({ number: 1, matchCount: 1 })],
    });

    expect(resetCompetitionDialogCopy(oneMatch).intro).toBe(
      'The only match of "Sunday League" will be deleted and season 1 will start again today. This cannot be undone.',
    );
  });
});
