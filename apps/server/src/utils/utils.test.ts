import { describe, expect, it } from "vitest";
import { MatchResponse, MatchType, PlayerResponse } from "@repo/shared-types";
import {
  calculateLeaguePlayerStats,
  calculatePlayerStats,
  calculateWinRate,
  DRAW_WIN_WEIGHT,
} from "./utils";

/**
 * A Completed match between Home and Away, with the players named on each side.
 * A side's `ratings` name the players who scored; everyone else is 0, and a match
 * where nobody scored is one nobody voted on.
 */
type Side = {
  score: number;
  players: string[];
  penalties?: number;
  ratings?: Record<string, number>;
};

function match(
  home: Side,
  away: Side,
  id = `${home.players.join("+")}-v-${away.players.join("+")}`,
): MatchResponse {
  const side = (
    { players, ratings }: Side,
    isHome: boolean,
  ): PlayerResponse[] =>
    players.map((nickname, position) => ({
      id: `player-${nickname}`,
      nickname,
      isHome,
      goals: 0,
      assists: 0,
      position,
      rating: ratings?.[nickname] ?? 0,
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
    players: [...side(home, true), ...side(away, false)],
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

  it("averages the rating over the matches that were voted on", () => {
    const matches = [
      match(
        { score: 1, players: ["Ana"], ratings: { Ana: 3 } },
        { score: 0, players: ["Bo"], ratings: { Bo: 2 } },
      ),
      // Nobody voted: every rating is 0, so this match rates nobody.
      match({ score: 1, players: ["Ana"] }, { score: 0, players: ["Bo"] }),
    ];

    expect(statsFor("Ana", matches)).toMatchObject({ matches: 2, rating: 3 });
    expect(statsFor("Bo", matches)).toMatchObject({ matches: 2, rating: 2 });
  });

  it("counts a player who was rated and received nothing", () => {
    const matches = [
      match(
        { score: 1, players: ["Ana"], ratings: { Ana: 3 } },
        { score: 0, players: ["Bo"] },
      ),
    ];

    expect(statsFor("Bo", matches).rating).toBe(0);
  });

  it("leaves the rating undefined when every match was voteless", () => {
    const matches = [
      match({ score: 1, players: ["Ana"] }, { score: 0, players: ["Bo"] }),
      match({ score: 2, players: ["Ana"] }, { score: 0, players: ["Bo"] }),
    ];

    expect(statsFor("Ana", matches)).toMatchObject({
      matches: 2,
      rating: undefined,
    });
  });

  it("keeps dividing matches and the win rate by every match played", () => {
    const ana = statsFor("Ana", [
      match(
        { score: 2, players: ["Ana"], ratings: { Ana: 3 } },
        { score: 0, players: ["Bo"] },
      ),
      match({ score: 1, players: ["Ana"] }, { score: 1, players: ["Bo"] }),
    ]);

    expect(ana.matches).toBe(2);
    // (1 win + 1 draw * 0.3) / 2 matches — the voteless match still counts here
    expect(ana.winRate).toBe(65);
    // ...but not here: 3 over the one rated match, not over both
    expect(ana.rating).toBe(3);
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

  it("averages the rating over the matches that were voted on", () => {
    const rows = calculateLeaguePlayerStats([
      match(
        { score: 2, players: ["Ana"], ratings: { Ana: 3 } },
        { score: 0, players: ["Bo"] },
      ),
      match({ score: 1, players: ["Ana"] }, { score: 1, players: ["Bo"] }),
    ]);

    expect(rows.find((player) => player.nickname === "Ana")).toMatchObject({
      matches: 2,
      rating: 3,
    });
  });

  it("leaves the rating undefined when every match was voteless", () => {
    const rows = calculateLeaguePlayerStats([
      match({ score: 2, players: ["Ana"] }, { score: 0, players: ["Bo"] }),
    ]);

    expect(rows.find((player) => player.nickname === "Ana")).toMatchObject({
      matches: 1,
      rating: undefined,
    });
  });

  it("does not expose the rated-match tally on the totals", () => {
    const [row] = calculateLeaguePlayerStats([
      match({ score: 1, players: ["Ana"] }, { score: 1, players: ["Bo"] }),
    ]);

    expect(row).not.toHaveProperty("ratedMatches");
  });
});
