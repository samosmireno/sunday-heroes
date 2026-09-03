import {
  CompetitionResponse,
  CompetitionType,
  MatchResponse,
  MatchType,
  Role,
} from "@repo/shared-types";
import { DuelFormData } from "@/features/add-match-form/schemas/types";

export function matchResponse(
  overrides: Partial<MatchResponse> = {},
): MatchResponse {
  return {
    id: "match-1",
    date: "2026-09-06T12:00:00.000Z",
    matchType: MatchType.FIVE_A_SIDE,
    round: 1,
    homeTeamScore: 2,
    awayTeamScore: 1,
    isCompleted: true,
    teams: ["Home", "Away"],
    players: [],
    ...overrides,
  };
}

export function competitionResponse(
  overrides: Partial<CompetitionResponse> = {},
): CompetitionResponse {
  return {
    id: "comp-1",
    name: "Zlatna lopta",
    type: CompetitionType.DUEL,
    userRole: Role.ADMIN,
    votingEnabled: false,
    matches: [],
    playerStats: [],
    ...overrides,
  };
}

/** A valid Duel add-match form; the players' lines are filler, not under test. */
export function duelFormData(
  match: Partial<DuelFormData["match"]> = {},
): DuelFormData {
  return {
    match: {
      date: new Date("2026-09-06"),
      homeTeamScore: 2,
      awayTeamScore: 1,
      matchType: MatchType.FIVE_A_SIDE,
      hasPenalties: false,
      penaltyHomeScore: 0,
      penaltyAwayScore: 0,
      ...match,
    },
    players: { homePlayers: ["Ana"], awayPlayers: ["Bojan"] },
    matchPlayers: {
      players: [
        { nickname: "Ana", goals: 2, assists: 0, position: 0 },
        { nickname: "Bojan", goals: 1, assists: 0, position: 0 },
      ],
    },
  };
}
