import {
  CompetitionInfo,
  CompetitionResponse,
  CompetitionSettings,
  CompetitionType,
  CurrentSeasonResponse,
  LeagueMatchResponse,
  LeaguePlayerTotals,
  LeagueTeamResponse,
  MatchPageResponse,
  MatchResponse,
  MatchType,
  Role,
  SeasonResponse,
  VotingStatus,
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
    season: { number: 1, isClosed: false },
    ...overrides,
  };
}

/** A Standings row; at zero unless overridden. */
export function leagueTeamResponse(
  overrides: Partial<LeagueTeamResponse> = {},
): LeagueTeamResponse {
  const id = overrides.id ?? "team-1";
  const name = overrides.name ?? "Lions";
  return {
    id,
    name,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    goalDifference: 0,
    team: { id, name },
    ...overrides,
  };
}

/** A League player's totals as the stats read lists them; at zero unless overridden. */
export function leaguePlayerTotals(
  overrides: Partial<LeaguePlayerTotals> = {},
): LeaguePlayerTotals {
  const nickname = overrides.nickname ?? "Ana";
  return {
    id: `player-${nickname.toLowerCase()}`,
    nickname,
    matches: 0,
    wins: 0,
    winRate: 0,
    goals: 0,
    assists: 0,
    teamName: "Lions",
    ...overrides,
  };
}

/** A League Fixture as the fixtures read lists it: not completed, in Season 1. */
export function leagueMatchResponse(
  overrides: Partial<LeagueMatchResponse> = {},
): LeagueMatchResponse {
  return {
    id: "fixture-1",
    homeTeam: { id: "team-1", name: "Lions", score: 0 },
    awayTeam: { id: "team-2", name: "Tigers", score: 0 },
    homeScore: 0,
    awayScore: 0,
    date: null,
    round: 1,
    votingStatus: "CLOSED",
    isCompleted: false,
    season: { number: 1, isClosed: false },
    ...overrides,
  };
}

export function seasonResponse(
  overrides: Partial<SeasonResponse> = {},
): SeasonResponse {
  return {
    number: 1,
    startedAt: "2025-09-12T10:00:00.000Z",
    endedAt: null,
    matchCount: 0,
    completedMatchCount: 0,
    ...overrides,
  };
}

/** Seasons 1 and 2 are Past seasons; Season 3 is the Current season. */
export const threeSeasons: SeasonResponse[] = [
  seasonResponse({
    number: 1,
    startedAt: "2024-09-08T10:00:00.000Z",
    endedAt: "2025-03-02T10:00:00.000Z",
    matchCount: 20,
  }),
  seasonResponse({
    number: 2,
    startedAt: "2025-03-02T10:00:00.000Z",
    endedAt: "2025-09-14T10:00:00.000Z",
    matchCount: 12,
  }),
  seasonResponse({
    number: 3,
    startedAt: "2025-09-14T10:00:00.000Z",
    endedAt: null,
    matchCount: 10,
  }),
];

export function currentSeasonResponse(
  overrides: Partial<CurrentSeasonResponse> = {},
): CurrentSeasonResponse {
  return {
    ...seasonResponse(),
    notCompletedCount: 0,
    openVotingCount: 0,
    ...overrides,
  };
}

export function competitionSettings(
  overrides: Partial<CompetitionSettings> = {},
): CompetitionSettings {
  const currentSeason = overrides.currentSeason ?? currentSeasonResponse();
  return {
    id: "comp-1",
    name: "Sunday League",
    type: CompetitionType.LEAGUE,
    votingEnabled: false,
    userRole: Role.ADMIN,
    moderators: [],
    currentSeason,
    seasons: [currentSeason],
    ...overrides,
  };
}

export function competitionInfo(
  overrides: Partial<CompetitionInfo> = {},
): CompetitionInfo {
  return {
    id: "comp-1",
    name: "Zlatna lopta",
    type: CompetitionType.DUEL,
    votingEnabled: false,
    userRole: Role.PLAYER,
    seasons: [seasonResponse()],
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

/** One row of the All Matches list. */
export function matchPageResponse(
  overrides: Partial<MatchPageResponse> = {},
): MatchPageResponse {
  return {
    id: "match-1",
    date: "2026-09-06T12:00:00.000Z",
    competitionId: "comp-1",
    competitionName: "Zlatna lopta",
    competitionType: CompetitionType.DUEL,
    isAdmin: false,
    teams: ["Home", "Away"],
    scores: [2, 1],
    matchType: MatchType.FIVE_A_SIDE,
    votingEnabled: false,
    votingStatus: VotingStatus.CLOSED,
    playerCount: 10,
    pendingVotes: 0,
    playerStats: [],
    season: { number: 1, isClosed: false },
    ...overrides,
  };
}
