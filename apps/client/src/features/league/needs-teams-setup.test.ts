import { describe, expect, it } from "vitest";
import { CompetitionType, Role } from "@repo/shared-types";
import { seasonResponse } from "@/test/fixtures";
import { needsTeamsSetup } from "./needs-teams-setup";

const placeholderTeams = [
  { id: "team-1", name: "team-4821" },
  { id: "team-2", name: "Team 2" },
];
const namedTeams = [
  { id: "team-1", name: "Lions" },
  { id: "team-2", name: "Tigers" },
];

/** Season 1 closed with its Fixtures; the Current season 2 is empty. */
const afterRollover = [
  seasonResponse({
    number: 1,
    endedAt: "2026-03-01T10:00:00.000Z",
    matchCount: 6,
    completedMatchCount: 6,
  }),
  seasonResponse({ number: 2, matchCount: 0 }),
];
const seasonOneWithFixtures = [seasonResponse({ number: 1, matchCount: 6 })];

describe("needsTeamsSetup", () => {
  it("an admin whose teams are still placeholders sets them up", () => {
    expect(
      needsTeamsSetup({
        type: CompetitionType.LEAGUE,
        userRole: Role.ADMIN,
        seasons: seasonOneWithFixtures,
        teams: placeholderTeams,
      }),
    ).toBe(true);
  });

  it("an admin with named teams and an empty Current season sets up the new Season", () => {
    expect(
      needsTeamsSetup({
        type: CompetitionType.LEAGUE,
        userRole: Role.ADMIN,
        seasons: afterRollover,
        teams: namedTeams,
      }),
    ).toBe(true);
  });

  it("an admin with named teams and a Current season with Fixtures sees the League page", () => {
    expect(
      needsTeamsSetup({
        type: CompetitionType.LEAGUE,
        userRole: Role.ADMIN,
        seasons: seasonOneWithFixtures,
        teams: namedTeams,
      }),
    ).toBe(false);
  });

  it("a moderator is gated like an admin", () => {
    expect(
      needsTeamsSetup({
        type: CompetitionType.LEAGUE,
        userRole: Role.MODERATOR,
        seasons: afterRollover,
        teams: namedTeams,
      }),
    ).toBe(true);
  });

  it("a player never sees Teams setup, placeholders or not", () => {
    expect(
      needsTeamsSetup({
        type: CompetitionType.LEAGUE,
        userRole: Role.PLAYER,
        seasons: afterRollover,
        teams: placeholderTeams,
      }),
    ).toBe(false);
  });

  it("a Duel never needs Teams setup", () => {
    expect(
      needsTeamsSetup({
        type: CompetitionType.DUEL,
        userRole: Role.ADMIN,
        seasons: afterRollover,
        teams: [
          { id: "team-1", name: "Home" },
          { id: "team-2", name: "Away" },
        ],
      }),
    ).toBe(false);
  });
});
