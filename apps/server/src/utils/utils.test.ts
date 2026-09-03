import { describe, expect, it } from "vitest";
import { MatchResponse, MatchType, PlayerResponse } from "@repo/shared-types";
import {
  calculateLeaguePlayerStats,
  calculatePlayerStats,
  calculateWinRate,
  DRAW_WIN_WEIGHT,
} from "./utils";

/** A Completed match between Home and Away, with the players named on each side. */
function match(
  home: { score: number; players: string[]; penalties?: number },
  away: { score: number; players: string[]; penalties?: number },
  id = `${home.players.join("+")}-v-${away.players.join("+")}`,
): MatchResponse {
  const side = (names: string[], isHome: boolean): PlayerResponse[] =>
    names.map((nickname, position) => ({
      id: `player-${nickname}`,
      nickname,
      isHome,
      goals: 0,
      assists: 0,
      position,
      rating: 0,
      manOfTheMatch: false,
    }));
  return {
    id,
    matchType: MatchType.FIVE_A_SIDE,
    round: 1,
    homeTeamScore: home.score,
    awayTeamScore: away.score,
    penaltyHomeScore: home.penalties,
    penaltyAwayScore: away.penalties,
    isCompleted: true,
    teams: ["Home", "Away"],
    players: [...side(home.players, true), ...side(away.players, false)],
    season: { number: 1, isClosed: false },
  };
}

function statsFor(nickname: string, matches: MatchResponse[]) {
  const row = calculatePlayerStats(matches).find(
    (player) => player.nickname === nickname,
  );
  if (!row) throw new Error(`no stats for ${nickname}`);
  return row;
}

describe("calculateWinRate", () => {
  it("weights a draw at the draw weight of a win", () => {
    expect(DRAW_WIN_WEIGHT).toBe(0.3);
    expect(calculateWinRate(1, 0, 1)).toBe(100);
    expect(calculateWinRate(0, 1, 1)).toBe(30);
    expect(calculateWinRate(0, 0, 1)).toBe(0);
  });

  it("is a percentage of matches played, to two decimals", () => {
    // (1 + 0.3) / 4
    expect(calculateWinRate(1, 1, 4)).toBe(32.5);
    // (1 + 0.3) / 3
    expect(calculateWinRate(1, 1, 3)).toBe(43.33);
  });

  it("is zero for a player with no matches", () => {
    expect(calculateWinRate(0, 0, 0)).toBe(0);
  });
});

describe("calculatePlayerStats", () => {
  it("counts a win as one and a draw as the draw weight, over every match played", () => {
    const ana = statsFor("Ana", [
      match({ score: 2, players: ["Ana"] }, { score: 0, players: ["Bo"] }),
      match({ score: 1, players: ["Ana"] }, { score: 1, players: ["Bo"] }),
      match({ score: 0, players: ["Ana"] }, { score: 3, players: ["Bo"] }),
      match({ score: 0, players: ["Bo"] }, { score: 0, players: ["Ana"] }),
    ]);

    expect(ana.matches).toBe(4);
    expect(ana.wins).toBe(1);
    // (1 win + 2 draws * 0.3) / 4 matches
    expect(ana.winRate).toBe(40);
  });

  it("gives the losing side of a draw-free match no credit", () => {
    const bo = statsFor("Bo", [
      match({ score: 2, players: ["Ana"] }, { score: 0, players: ["Bo"] }),
    ]);

    expect(bo.wins).toBe(0);
    expect(bo.winRate).toBe(0);
  });

  it("does not treat a level score decided on penalties as a draw", () => {
    const matches = [
      match(
        { score: 1, players: ["Ana"], penalties: 4 },
        { score: 1, players: ["Bo"], penalties: 3 },
      ),
    ];

    expect(statsFor("Ana", matches).winRate).toBe(100);
    expect(statsFor("Bo", matches).winRate).toBe(0);
  });

  it("treats a level score with level penalties as a draw", () => {
    const matches = [
      match(
        { score: 1, players: ["Ana"], penalties: 3 },
        { score: 1, players: ["Bo"], penalties: 3 },
      ),
    ];

    expect(statsFor("Ana", matches).winRate).toBe(30);
    expect(statsFor("Bo", matches).winRate).toBe(30);
  });

  it("does not expose the draw tally on the totals", () => {
    const [row] = calculatePlayerStats([
      match({ score: 1, players: ["Ana"] }, { score: 1, players: ["Bo"] }),
    ]);

    expect(row).not.toHaveProperty("draws");
  });
});

describe("calculateLeaguePlayerStats", () => {
  it("weights draws the same way and keeps the player's team", () => {
    const rows = calculateLeaguePlayerStats([
      match({ score: 2, players: ["Ana"] }, { score: 0, players: ["Bo"] }),
      match({ score: 1, players: ["Ana"] }, { score: 1, players: ["Bo"] }),
    ]);
    const ana = rows.find((player) => player.nickname === "Ana");
    const bo = rows.find((player) => player.nickname === "Bo");

    // (1 win + 1 draw * 0.3) / 2 matches
    expect(ana).toMatchObject({ teamName: "Home", wins: 1, winRate: 65 });
    // (0 wins + 1 draw * 0.3) / 2 matches
    expect(bo).toMatchObject({ teamName: "Away", wins: 0, winRate: 15 });
    expect(ana).not.toHaveProperty("draws");
  });
});
