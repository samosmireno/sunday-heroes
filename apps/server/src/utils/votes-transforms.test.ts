import { describe, expect, it } from "vitest";
import { CompetitionType, Role } from "@prisma/client";
import { MatchWithVotes } from "../repositories/match/types";
import { CompetitionWithSettings } from "../repositories/competition/types";
import { transformMatchServiceToPendingVotes } from "./votes-transforms";
import { gate } from "../../test/voting-eligibility-fixtures";

const MATCH = "match-1";
const COMPETITION = "competition-1";
const ADMIN_USER = "user-admin";

const ANA = "player-ana";
const BEA = "player-bea";
const CAL = "player-cal";

/** Ana and Bea at home, Cal away; `voted` names whoever has already balloted. */
function matchWithVotes(voted: string[] = []): MatchWithVotes {
  const player = (id: string, nickname: string, userId: string | null) => ({
    dashboardPlayerId: id,
    dashboardPlayer: {
      id,
      nickname,
      userId,
      votesGiven: voted.includes(id) ? [{ matchId: MATCH }] : [],
    },
  });

  return {
    id: MATCH,
    competitionId: COMPETITION,
    date: new Date("2026-01-10T00:00:00.000Z"),
    homeTeamScore: 2,
    awayTeamScore: 1,
    matchTeams: [{ team: { name: "Home" } }, { team: { name: "Away" } }],
    matchPlayers: [
      player(ANA, "Ana", "user-ana"),
      player(BEA, "Bea", "user-bea"),
      player(CAL, "Cal", null),
    ],
  } as unknown as MatchWithVotes;
}

function competition(): CompetitionWithSettings {
  return {
    id: COMPETITION,
    name: "Zlatna lopta",
    type: CompetitionType.DUEL,
    dashboard: { id: "dashboard-1", adminId: ADMIN_USER },
    moderators: [],
  } as unknown as CompetitionWithSettings;
}

describe("transformMatchServiceToPendingVotes", () => {
  it("carries every player's standing, ineligible players included", () => {
    const response = transformMatchServiceToPendingVotes(
      matchWithVotes(),
      competition(),
      ADMIN_USER,
      gate(5, [ANA, BEA]),
    );

    // Cal is still listed. The admin casting on someone's behalf has to see
    // who cannot vote and why; a name that vanishes reads as a bug.
    expect(response.players.map((player) => player.playerId)).toEqual([
      ANA,
      BEA,
      CAL,
    ]);
    expect(
      response.players.map((player) => player.eligibility.canVote),
    ).toEqual([true, true, false]);
  });

  it("reads each record off that player's own dashboard player id", () => {
    const response = transformMatchServiceToPendingVotes(
      matchWithVotes(),
      competition(),
      ADMIN_USER,
      gate(5, [ANA]),
    );

    const [ana, , cal] = response.players;

    expect(ana.eligibility).toEqual({
      canVote: true,
      qualified: true,
      armed: true,
      threshold: 5,
      matchesThisSeason: 5,
      remaining: 0,
    });
    expect(cal.eligibility).toEqual({
      canVote: false,
      qualified: false,
      armed: true,
      threshold: 5,
      matchesThisSeason: 0,
      remaining: 5,
    });
  });

  it("is byte-identical to the pre-gate response for a Competition with no threshold", () => {
    const response = transformMatchServiceToPendingVotes(
      matchWithVotes([ANA]),
      competition(),
      "user-bea",
      gate(null),
    );

    const noGate = {
      canVote: true,
      qualified: false,
      armed: false,
      threshold: null,
      matchesThisSeason: 0,
      remaining: 0,
    };

    expect(response).toEqual({
      userRole: Role.PLAYER,
      matchId: MATCH,
      matchDate: new Date("2026-01-10T00:00:00.000Z").toDateString(),
      competitionId: COMPETITION,
      competitionName: "Zlatna lopta",
      teams: ["Home", "Away"],
      homeScore: 2,
      awayScore: 1,
      players: [
        {
          playerName: "Ana",
          playerId: ANA,
          voted: true,
          isUser: false,
          eligibility: noGate,
        },
        {
          playerName: "Bea",
          playerId: BEA,
          voted: false,
          isUser: true,
          eligibility: noGate,
        },
        {
          playerName: "Cal",
          playerId: CAL,
          voted: false,
          isUser: false,
          eligibility: noGate,
        },
      ],
    });
  });

  it("still names the admin as the admin", () => {
    const response = transformMatchServiceToPendingVotes(
      matchWithVotes(),
      competition(),
      ADMIN_USER,
      gate(null),
    );

    expect(response.userRole).toBe(Role.ADMIN);
  });
});
