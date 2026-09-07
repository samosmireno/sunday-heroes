import { describe, expect, it } from "vitest";
import {
  addPlayersToFixture,
  createDuel,
  createDuelMatch,
  createLeague,
  createUserWithDashboard,
  defaultDuelPlayers,
  markCompleted,
} from "../../../test/factories";
import { SeasonService } from "../../services/season-service";
import prisma from "../prisma-client";
import { SeasonRepo } from "../season/season-repo";
import { VotingEligibilityRepo } from "./voting-eligibility-repo";

/** The dashboard player a factory created by nickname. */
async function playerId(dashboardId: string, nickname: string) {
  const player = await prisma.dashboardPlayer.findFirstOrThrow({
    where: { dashboardId, nickname },
  });
  return player.id;
}

describe("VotingEligibilityRepo.participationCounts", () => {
  it("groups Completed matches per competition, player and Season", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const { competition } = await createDuel({ userId: user.id });

    // Season 1: two matches, the second without Dan.
    await createDuelMatch({ competitionId: competition.id });
    await createDuelMatch({
      competitionId: competition.id,
      players: defaultDuelPlayers.filter((p) => p.nickname !== "Dan"),
    });
    const seasonOne = await SeasonRepo.findCurrent(competition.id);
    await SeasonService.startNewSeason(competition.id, user.id);
    // Season 2: one match, everybody back.
    await createDuelMatch({ competitionId: competition.id });
    const seasonTwo = await SeasonRepo.findCurrent(competition.id);

    const rows = await VotingEligibilityRepo.participationCounts([
      competition.id,
    ]);

    const [ana, dan] = await Promise.all([
      playerId(dashboard.id, "Ana"),
      playerId(dashboard.id, "Dan"),
    ]);

    // Counts never pool across Seasons: Ana's three matches arrive as 2 + 1.
    expect(rows).toContainEqual({
      competitionId: competition.id,
      dashboardPlayerId: ana,
      seasonId: seasonOne!.id,
      count: 2,
    });
    expect(rows).toContainEqual({
      competitionId: competition.id,
      dashboardPlayerId: ana,
      seasonId: seasonTwo!.id,
      count: 1,
    });
    expect(rows).toContainEqual({
      competitionId: competition.id,
      dashboardPlayerId: dan,
      seasonId: seasonOne!.id,
      count: 1,
    });
    // Four players in Season 1 and four in Season 2, one row each.
    expect(rows).toHaveLength(8);
  });

  it("counts Completed matches only", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const { competition, fixtures } = await createLeague({ userId: user.id });
    await addPlayersToFixture(fixtures[0].match.id, [
      { nickname: "Ana", isHome: true },
      { nickname: "Cal", isHome: false },
    ]);

    expect(
      await VotingEligibilityRepo.participationCounts([competition.id]),
    ).toEqual([]);

    await markCompleted(fixtures[0].match.id);

    const rows = await VotingEligibilityRepo.participationCounts([
      competition.id,
    ]);
    expect(rows).toHaveLength(2);
    expect(rows).toContainEqual({
      competitionId: competition.id,
      dashboardPlayerId: await playerId(dashboard.id, "Ana"),
      seasonId: fixtures[0].match.seasonId,
      count: 1,
    });
  });

  it("answers for several Competitions in one call, and says nothing for one with no matches", async () => {
    const { user, dashboard } = await createUserWithDashboard();
    const [first, second, empty] = await Promise.all([
      createDuel({ userId: user.id, name: "First" }),
      createDuel({ userId: user.id, name: "Second" }),
      createDuel({ userId: user.id, name: "Empty" }),
    ]);
    await createDuelMatch({ competitionId: first.competition.id });
    await createDuelMatch({
      competitionId: second.competition.id,
      players: defaultDuelPlayers.filter((p) => p.nickname !== "Dan"),
    });

    const rows = await VotingEligibilityRepo.participationCounts([
      first.competition.id,
      second.competition.id,
      empty.competition.id,
    ]);

    const byCompetition = new Map<string, number>();
    for (const row of rows) {
      byCompetition.set(
        row.competitionId,
        (byCompetition.get(row.competitionId) ?? 0) + 1,
      );
    }
    expect(byCompetition.get(first.competition.id)).toBe(4);
    expect(byCompetition.get(second.competition.id)).toBe(3);
    expect(byCompetition.has(empty.competition.id)).toBe(false);

    // A player's row belongs to the Competition they played it in, not to both.
    const ana = await playerId(dashboard.id, "Ana");
    expect(
      rows.filter((row) => row.dashboardPlayerId === ana).map((r) => r.count),
    ).toEqual([1, 1]);
  });

  it("returns nothing for an empty list of Competitions", async () => {
    expect(await VotingEligibilityRepo.participationCounts([])).toEqual([]);
  });
});

describe("VotingEligibilityRepo.completedMatchCounts", () => {
  it("counts a Competition's Completed matches across every Season", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({ userId: user.id });
    await createDuelMatch({ competitionId: competition.id });
    await SeasonService.startNewSeason(competition.id, user.id);
    await createDuelMatch({ competitionId: competition.id });
    await createDuelMatch({ competitionId: competition.id });

    const counts = await VotingEligibilityRepo.completedMatchCounts([
      competition.id,
    ]);

    expect(counts.get(competition.id)).toBe(3);
  });

  it("leaves out matches that are not Completed", async () => {
    const { user } = await createUserWithDashboard();
    const { competition, fixtures } = await createLeague({ userId: user.id });

    expect(
      (await VotingEligibilityRepo.completedMatchCounts([competition.id])).get(
        competition.id,
      ),
    ).toBeUndefined();

    await markCompleted(fixtures[0].match.id);
    await markCompleted(fixtures[1].match.id);

    const counts = await VotingEligibilityRepo.completedMatchCounts([
      competition.id,
    ]);
    expect(counts.get(competition.id)).toBe(2);
  });

  it("answers for several Competitions in one call, omitting one with no matches", async () => {
    const { user } = await createUserWithDashboard();
    const [first, second, empty] = await Promise.all([
      createDuel({ userId: user.id, name: "First" }),
      createDuel({ userId: user.id, name: "Second" }),
      createDuel({ userId: user.id, name: "Empty" }),
    ]);
    await createDuelMatch({ competitionId: first.competition.id });
    await createDuelMatch({ competitionId: first.competition.id });
    await createDuelMatch({ competitionId: second.competition.id });

    const counts = await VotingEligibilityRepo.completedMatchCounts([
      first.competition.id,
      second.competition.id,
      empty.competition.id,
    ]);

    expect(counts.get(first.competition.id)).toBe(2);
    expect(counts.get(second.competition.id)).toBe(1);
    expect(counts.has(empty.competition.id)).toBe(false);
  });

  it("returns an empty map for an empty list of Competitions", async () => {
    expect(await VotingEligibilityRepo.completedMatchCounts([])).toEqual(
      new Map(),
    );
  });
});
