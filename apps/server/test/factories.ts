/**
 * Factories build test state through the real services wherever one exists, so tests
 * exercise the same transactions production does. Raw Prisma is used only for leaf
 * state with no cheap service path: the user and dashboard that own a competition,
 * players on a Fixture, scores, and completion.
 */
import { randomUUID } from "node:crypto";
import { MatchType as PrismaMatchType } from "@prisma/client";
import { CompetitionType, MatchType, Team } from "@repo/shared-types";
import prisma from "../src/repositories/prisma-client";
import { createMatchRequest } from "../src/schemas/create-match-request-schema";
import { CompetitionModeratorService } from "../src/services/competition-moderator-service";
import { CompetitionService } from "../src/services/competition-service";
import { LeagueService } from "../src/services/league-service";
import { MatchService } from "../src/services/match/match-service";
import { SeasonService } from "../src/services/season-service";
import { TeamService } from "../src/services/team-service";

/** A registered user who owns no dashboard: a player wherever they appear. */
export async function createUser(options: { givenName?: string } = {}) {
  return prisma.user.create({
    data: {
      email: `${options.givenName?.toLowerCase() ?? "user"}-${randomUUID()}@example.test`,
      givenName: options.givenName ?? "Player",
      isRegistered: true,
    },
  });
}

export async function createUserWithDashboard(
  options: { email?: string } = {},
) {
  const user = await prisma.user.create({
    data: {
      email: options.email ?? `admin-${randomUUID()}@example.test`,
      givenName: "Admin",
      isRegistered: true,
    },
  });

  const dashboard = await prisma.dashboard.create({
    data: { name: "Test dashboard", adminId: user.id },
  });

  return { user, dashboard };
}

/**
 * A new user made moderator of the Competition through the moderator service,
 * via the dashboard player that links the user to the dashboard.
 */
export async function addModerator(options: {
  competitionId: string;
  dashboardId: string;
}) {
  const user = await createUser({ givenName: "Moderator" });
  const dashboardPlayer = await prisma.dashboardPlayer.create({
    data: {
      dashboardId: options.dashboardId,
      userId: user.id,
      nickname: `Moderator ${user.id.slice(0, 8)}`,
    },
  });
  await CompetitionModeratorService.addModeratorToCompetition(
    options.competitionId,
    dashboardPlayer.id,
  );

  return { user, dashboardPlayer };
}

/** The fields every create-competition request needs. */
function competitionRequest(fields: {
  userId: string;
  name: string;
  type: CompetitionType;
  votingEnabled?: boolean;
}) {
  const votingEnabled = fields.votingEnabled ?? false;

  return {
    userId: fields.userId,
    name: fields.name,
    type: fields.type,
    votingEnabled,
    ...(votingEnabled ? { votingPeriodDays: 7, reminderDays: 3 } : {}),
  };
}

/** A Duel through competition creation, with the two fixed teams the handler adds. */
export async function createDuel(options: {
  userId: string;
  name?: string;
  votingEnabled?: boolean;
}) {
  const competition = await CompetitionService.createCompetition(
    competitionRequest({
      userId: options.userId,
      name: options.name ?? "Duel",
      type: CompetitionType.DUEL,
      votingEnabled: options.votingEnabled,
    }),
  );

  const home = await TeamService.createTeamInCompetition(
    Team.HOME,
    competition.id,
    options.userId,
  );
  const away = await TeamService.createTeamInCompetition(
    Team.AWAY,
    competition.id,
    options.userId,
  );

  return { competition, home, away };
}

/** A League with its teams and Fixtures through League creation. */
export async function createLeague(options: {
  userId: string;
  name?: string;
  numberOfTeams?: number;
  /** true means a double round-robin; the request field keeps its historical name. */
  isRoundRobin?: boolean;
}) {
  return LeagueService.createLeague(
    {
      ...competitionRequest({
        userId: options.userId,
        name: options.name ?? "League",
        type: CompetitionType.LEAGUE,
      }),
      matchType: PrismaMatchType.FIVE_A_SIDE,
      numberOfTeams: options.numberOfTeams ?? 4,
      isRoundRobin: options.isRoundRobin ?? false,
    },
    options.userId,
  );
}

/**
 * A Duel whose Season 1 holds one Match and is closed through Start new season,
 * so Season 2 is the Current season.
 */
export async function createDuelWithClosedSeason(options: {
  userId: string;
  name?: string;
  votingEnabled?: boolean;
}) {
  const duel = await createDuel(options);
  const seasonOneMatch = await createDuelMatch({
    competitionId: duel.competition.id,
  });
  const currentSeason = await SeasonService.startNewSeason(
    duel.competition.id,
    options.userId,
  );

  return { ...duel, seasonOneMatch, currentSeason };
}

/**
 * A League whose Season 1 holds its initial Fixtures and is closed through
 * Start new season, so Season 2 is the Current season and has no Match yet.
 */
export async function createLeagueWithClosedSeason(options: {
  userId: string;
  name?: string;
  numberOfTeams?: number;
  isRoundRobin?: boolean;
}) {
  const league = await createLeague(options);
  const currentSeason = await SeasonService.startNewSeason(
    league.competition.id,
    options.userId,
  );

  return { ...league, currentSeason };
}

export const defaultDuelPlayers: createMatchRequest["players"] = [
  { nickname: "Ana", goals: 1, assists: 0, position: 1, isHome: true },
  { nickname: "Bea", goals: 1, assists: 1, position: 2, isHome: true },
  { nickname: "Cal", goals: 1, assists: 0, position: 1, isHome: false },
  { nickname: "Dan", goals: 0, assists: 1, position: 2, isHome: false },
];

/** A Duel Match through match creation, between the Duel's fixed Home and Away teams. */
export async function createDuelMatch(options: {
  competitionId: string;
  homeTeamScore?: number;
  awayTeamScore?: number;
  players?: createMatchRequest["players"];
  date?: string;
}) {
  return MatchService.createMatch({
    competitionId: options.competitionId,
    date: options.date ?? "2026-01-10",
    homeTeamScore: options.homeTeamScore ?? 2,
    awayTeamScore: options.awayTeamScore ?? 1,
    matchType: MatchType.FIVE_A_SIDE,
    round: 1,
    teams: [Team.HOME, Team.AWAY],
    players: options.players ?? defaultDuelPlayers,
  });
}

export interface FixturePlayer {
  nickname: string;
  isHome: boolean;
  goals?: number;
  assists?: number;
}

/** Puts players on a Fixture, creating dashboard players by nickname as needed. */
export async function addPlayersToFixture(
  matchId: string,
  players: FixturePlayer[],
) {
  const match = await prisma.match.findUniqueOrThrow({
    where: { id: matchId },
    include: {
      matchTeams: true,
      competition: { select: { dashboardId: true } },
    },
  });
  const { dashboardId } = match.competition;

  const teamIdForSide = (isHome: boolean) => {
    const matchTeam = match.matchTeams.find((mt) => mt.isHome === isHome);
    if (!matchTeam) {
      throw new Error(
        `Match ${matchId} has no ${isHome ? "home" : "away"} team`,
      );
    }
    return matchTeam.teamId;
  };

  const positions = { home: 0, away: 0 };

  for (const player of players) {
    const dashboardPlayer = await prisma.dashboardPlayer.upsert({
      where: {
        dashboardId_nickname: { dashboardId, nickname: player.nickname },
      },
      create: { dashboardId, nickname: player.nickname },
      update: {},
    });

    const side = player.isHome ? "home" : "away";
    positions[side] += 1;

    await prisma.matchPlayer.create({
      data: {
        matchId,
        dashboardPlayerId: dashboardPlayer.id,
        teamId: teamIdForSide(player.isHome),
        isHome: player.isHome,
        goals: player.goals ?? 0,
        assists: player.assists ?? 0,
        position: positions[side],
      },
    });
  }
}

/** Enters a score on a Fixture without completing it. */
export async function setFixtureScore(
  matchId: string,
  homeTeamScore: number,
  awayTeamScore: number,
) {
  return prisma.match.update({
    where: { id: matchId },
    data: { homeTeamScore, awayTeamScore },
  });
}

/** Gives a Fixture the date League completion requires. */
export async function setFixtureDate(matchId: string, date: Date) {
  return prisma.match.update({ where: { id: matchId }, data: { date } });
}

/**
 * Flags a Match as a Completed match. This is leaf state only: unlike
 * `LeagueService.completeMatch`, it does not touch the Standings counters on
 * `TeamCompetition`, so a test about stored Standings must go through the service.
 */
export async function markCompleted(matchId: string) {
  return prisma.match.update({
    where: { id: matchId },
    data: { isCompleted: true },
  });
}
