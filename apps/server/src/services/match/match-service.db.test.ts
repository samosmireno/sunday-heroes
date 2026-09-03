import { CompetitionType } from "@repo/shared-types";
import { describe, expect, it } from "vitest";
import {
  createDuel,
  createDuelMatch,
  createUserWithDashboard,
} from "../../../test/factories";
import { SeasonRepo } from "../../repositories/season/season-repo";
import { CompetitionService } from "../competition-service";
import { MatchService } from "./match-service";

describe("Duel Match creation", () => {
  it("a Duel and its Match read back through the competition and match services", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({
      userId: user.id,
      name: "Thursday Duel",
    });

    const created = await createDuelMatch({
      competitionId: competition.id,
      homeTeamScore: 3,
      awayTeamScore: 1,
    });

    const stats = await CompetitionService.getCompetitionStats(
      competition.id,
      user.id,
    );
    expect(stats.type).toBe(CompetitionType.DUEL);
    expect(stats.matches).toHaveLength(1);
    expect(stats.matches[0]).toMatchObject({
      id: created.id,
      homeTeamScore: 3,
      awayTeamScore: 1,
    });

    const match = await MatchService.getMatchById(created.id);
    expect(match?.teams.sort()).toEqual(["Away", "Home"]);
    expect(match?.players.map((player) => player.nickname).sort()).toEqual([
      "Ana",
      "Bea",
      "Cal",
      "Dan",
    ]);
  });

  it("stamps a new Match with the Current season although the request carries none", async () => {
    const { user } = await createUserWithDashboard();
    const { competition } = await createDuel({ userId: user.id });

    const created = await createDuelMatch({ competitionId: competition.id });

    const current = await SeasonRepo.findCurrent(competition.id);
    expect(created.seasonId).toBe(current?.id);
    expect(await SeasonRepo.listWithCounts(competition.id)).toEqual([
      expect.objectContaining({ number: 1, matchCount: 1 }),
    ]);
  });
});
