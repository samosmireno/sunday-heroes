import { CompetitionService } from "./competition-service";
import { TeamService } from "./team-service";
import {
  MatchRepo,
  MatchWithDetails,
  MatchWithTeams,
} from "../repositories/match-repo";
import { CompetitionAuthRepo } from "../repositories/competition/competition-auth-repo";
import { MatchType, Prisma, VotingStatus } from "@prisma/client";
import { TeamCompetitionRepo } from "../repositories/team-competition-repo";
import prisma from "../repositories/prisma-client";
import { MatchTeamRepo } from "../repositories/match-team-repo";
import { CreateLeagueRequest } from "../schemas/league-schemas";
import { TeamRepo } from "../repositories/team-repo";
import { DashboardService } from "./dashboard-service";
import { CompetitionRepo } from "../repositories/competition/competition-repo";
import {
  transformCompetitionToPlayerStatsResponse,
  transformTeamCompetitionToStandingsResponse,
} from "../utils/league-transforms";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from "../utils/errors";

interface MatchStats {
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
}

export class LeagueService {
  static async createLeague(request: CreateLeagueRequest, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const competition = await CompetitionService.createCompetition(request);

      const teams = [];
      for (let i = 0; i < request.number_of_teams; i++) {
        const teamName = `team-${Math.floor(Math.random() * 10000)}`;

        const team = await TeamService.createTeamInCompetition(
          teamName,
          competition.id,
          userId
        );
        teams.push(team);
      }

      const fixtures = await this.generateLeagueFixtures(
        competition.id,
        teams,
        request.is_round_robin || false,
        request.match_type,
        tx
      );

      return {
        competition,
        teams,
        fixtures,
      };
    });
  }

  static async generateLeagueFixtures(
    competitionId: string,
    teams: { id: string; name: string }[],
    isDoubleRoundRobin: boolean = false,
    matchType: MatchType,
    tx?: Prisma.TransactionClient
  ) {
    const fixtures = [];

    const roundMatches = this.generateRoundRobinMatches(
      teams,
      isDoubleRoundRobin
    );

    for (let roundIndex = 0; roundIndex < roundMatches.length; roundIndex++) {
      const round = roundIndex + 1;

      for (const match of roundMatches[roundIndex]) {
        const createdMatch = await MatchRepo.create({
          created_at: new Date(),
          competition_id: competitionId,
          match_type: matchType,
          date: null,
          round: round,
          home_team_score: 0,
          away_team_score: 0,
          penalty_home_score: null,
          penalty_away_score: null,
          bracket_position: null,
          voting_status: VotingStatus.CLOSED,
          voting_ends_at: null,
          is_completed: false,
        });

        await MatchTeamRepo.create(
          createdMatch.id,
          match.homeTeam.id,
          true,
          tx
        );
        await MatchTeamRepo.create(
          createdMatch.id,
          match.awayTeam.id,
          false,
          tx
        );

        fixtures.push({
          match: createdMatch,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          round: round,
        });
      }
    }

    return fixtures;
  }

  private static generateRoundRobinMatches(
    teams: { id: string; name: string }[],
    isDoubleRoundRobin: boolean = false
  ) {
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const numberOfTeams = shuffledTeams.length;
    const hasBye = numberOfTeams % 2 !== 0;

    if (hasBye) {
      shuffledTeams.push({ id: "BYE", name: "BYE" });
    }

    const rounds = shuffledTeams.length - 1;
    const half = shuffledTeams.length / 2;
    const fixtures = [];

    const homeAwayBalance: Record<string, number> = {};
    shuffledTeams.forEach((team) => {
      homeAwayBalance[team.id] = 0;
    });

    for (let round = 0; round < rounds; round++) {
      const roundMatches = [];

      for (let i = 0; i < half; i++) {
        const homeTeam = shuffledTeams[i];
        const awayTeam = shuffledTeams[shuffledTeams.length - 1 - i];

        if (homeTeam.id === "BYE" || awayTeam.id === "BYE") continue;

        let swap = Math.random() < 0.5;

        if (homeAwayBalance[homeTeam.id] > homeAwayBalance[awayTeam.id]) {
          swap = true;
        } else if (
          homeAwayBalance[awayTeam.id] > homeAwayBalance[homeTeam.id]
        ) {
          swap = false;
        }

        if (swap) {
          roundMatches.push({
            homeTeam: awayTeam,
            awayTeam: homeTeam,
          });
          homeAwayBalance[awayTeam.id]++;
        } else {
          roundMatches.push({
            homeTeam: homeTeam,
            awayTeam: awayTeam,
          });
          homeAwayBalance[homeTeam.id]++;
        }
      }

      fixtures.push(roundMatches);

      const fixed = shuffledTeams[0];
      const rotating = shuffledTeams.slice(1);
      rotating.unshift(rotating.pop()!);
      shuffledTeams.splice(1, shuffledTeams.length - 1, ...rotating);
    }

    if (isDoubleRoundRobin) {
      const reverseFixtures = fixtures.map((round) =>
        round.map((match) => ({
          homeTeam: match.awayTeam,
          awayTeam: match.homeTeam,
        }))
      );
      return [...fixtures, ...reverseFixtures];
    }

    return fixtures;
  }

  static async getLeagueStandings(competitionId: string) {
    const teamCompetitions =
      await TeamCompetitionRepo.getTeamCompetitionsForLeague(competitionId);

    const standings =
      transformTeamCompetitionToStandingsResponse(teamCompetitions);

    return standings;
  }

  static async recalculateLeagueStandings(
    match: MatchWithTeams,
    newHomeScore: number,
    newAwayScore: number
  ) {
    const homeTeam = match.match_teams.find((mt) => mt.is_home);
    const awayTeam = match.match_teams.find((mt) => !mt.is_home);

    if (!homeTeam || !awayTeam) {
      throw new NotFoundError("Match team");
    }

    const result = this.calculateMatchResult(newHomeScore, newAwayScore);
    const previousResult = this.calculateMatchResult(
      match.home_team_score,
      match.away_team_score
    );

    const diffHomeStats = this.calculateStatsDifference(
      previousResult.homeTeamStats,
      result.homeTeamStats
    );

    const diffAwayStats = this.calculateStatsDifference(
      previousResult.awayTeamStats,
      result.awayTeamStats
    );

    await prisma.$transaction(async (tx) => {
      await TeamCompetitionRepo.incrementTeamStats(
        homeTeam.team_id,
        match.competition_id,
        diffHomeStats,
        tx
      );

      await TeamCompetitionRepo.incrementTeamStats(
        awayTeam.team_id,
        match.competition_id,
        diffAwayStats,
        tx
      );
    });
  }

  private static calculateStatsDifference(
    previousStats: MatchStats,
    newStats: MatchStats
  ): MatchStats {
    return {
      points: newStats.points - previousStats.points,
      wins: newStats.wins - previousStats.wins,
      draws: newStats.draws - previousStats.draws,
      losses: newStats.losses - previousStats.losses,
      goals_for: newStats.goals_for - previousStats.goals_for,
      goals_against: newStats.goals_against - previousStats.goals_against,
    };
  }

  private static calculateMatchResult(homeScore: number, awayScore: number) {
    let homePoints = 0,
      awayPoints = 0;
    let homeWins = 0,
      homeDraws = 0,
      homeLosses = 0;
    let awayWins = 0,
      awayDraws = 0,
      awayLosses = 0;

    if (homeScore > awayScore) {
      homePoints = 3;
      homeWins = 1;
      awayLosses = 1;
    } else if (homeScore < awayScore) {
      awayPoints = 3;
      awayWins = 1;
      homeLosses = 1;
    } else {
      homePoints = awayPoints = 1;
      homeDraws = awayDraws = 1;
    }

    return {
      homeTeamStats: {
        points: homePoints,
        wins: homeWins,
        draws: homeDraws,
        losses: homeLosses,
        goals_for: homeScore,
        goals_against: awayScore,
      },
      awayTeamStats: {
        points: awayPoints,
        wins: awayWins,
        draws: awayDraws,
        losses: awayLosses,
        goals_for: awayScore,
        goals_against: homeScore,
      },
    };
  }

  static async getLeagueFixtures(competitionId: string) {
    const fixtures = await MatchRepo.findByCompetitionId(competitionId);

    const fixturesByRound = fixtures.reduce(
      (acc, match) => {
        const round = match.round;
        if (!acc[round]) acc[round] = [];
        acc[round].push(match);
        return acc;
      },
      {} as Record<number, MatchWithDetails[]>
    );

    return fixturesByRound;
  }

  static async getPlayerStats(competitionId: string) {
    const competition =
      await CompetitionRepo.findByIdWithDetails(competitionId);
    if (!competition) {
      throw new NotFoundError("Competition");
    }
    return transformCompetitionToPlayerStatsResponse(competition);
  }

  static async getLeagueTeams(competitionId: string) {
    return await TeamCompetitionRepo.getAllTeamsInCompetition(competitionId);
  }

  static async updateTeamNames(
    competitionId: string,
    teamUpdates: {
      id: string;
      name: string;
    }[],
    userId: string
  ) {
    const hasPermission = await CompetitionAuthRepo.isUserAdminOrModerator(
      competitionId,
      userId
    );
    if (!hasPermission) {
      throw new AuthorizationError(
        "User is not authorized to update team names in this competition"
      );
    }

    const dashboardId =
      await DashboardService.getDashboardIdFromCompetitionId(competitionId);
    const results = [];

    await prisma.$transaction(async (tx) => {
      for (const update of teamUpdates) {
        const result = await this.handleTeamNameUpdate(
          update.id,
          update.name.trim(),
          competitionId,
          dashboardId,
          tx
        );
        results.push(result);
      }
    });

    return {
      success: true,
      updatedTeams: teamUpdates.length,
      updates: teamUpdates,
    };
  }

  private static async handleTeamNameUpdate(
    teamId: string,
    newName: string,
    competitionId: string,
    dashboardId: string,
    tx: any
  ) {
    const existingTeam = await TeamRepo.findByNameInDashboard(
      newName,
      dashboardId,
      tx
    );

    if (existingTeam && existingTeam.id !== teamId) {
      const existingInCompetition =
        await TeamCompetitionRepo.findByTeamAndCompetition(
          existingTeam.id,
          competitionId,
          tx
        );

      if (existingInCompetition) {
        throw new ConflictError(
          `Team with name "${newName}" already exists in this competition`
        );
      }
      await TeamCompetitionRepo.updateTeamId(
        teamId,
        existingTeam.id,
        competitionId,
        tx
      );

      await MatchTeamRepo.updateTeamReferences(teamId, existingTeam.id, tx);

      await TeamRepo.delete(teamId, tx);

      return {
        action: "merged",
        oldTeamId: teamId,
        newTeamId: existingTeam.id,
        teamName: newName,
      };
    } else {
      await TeamRepo.update(teamId, { name: newName }, tx);

      return {
        action: "renamed",
        teamId: teamId,
        newName: newName,
      };
    }
  }

  static async completeMatch(matchId: string, userId: string) {
    const match = await MatchRepo.findByIdWithTeams(matchId);
    if (!match) {
      throw new NotFoundError("Match");
    }

    if (match.is_completed) {
      throw new ConflictError("Match is already completed");
    }

    if (!this.isMatchFinished(match)) {
      throw new ConflictError(
        "Match cannot be completed. Ensure all players have played and the match has a date."
      );
    }

    const hasPermission = await CompetitionAuthRepo.isUserAdminOrModerator(
      match.competition_id,
      userId
    );

    if (!hasPermission) {
      throw new AuthorizationError(
        "User is not authorized to complete this match"
      );
    }

    const homeTeam = match.match_teams.find((mt) => mt.is_home);
    const awayTeam = match.match_teams.find((mt) => !mt.is_home);

    if (!homeTeam || !awayTeam) {
      throw new NotFoundError("Match team");
    }

    await prisma.$transaction(async (tx) => {
      await MatchRepo.update(matchId, { is_completed: true }, tx);

      const result = this.calculateMatchResult(
        match.home_team_score,
        match.away_team_score
      );

      await TeamCompetitionRepo.incrementTeamStats(
        homeTeam.team_id,
        match.competition_id,
        result.homeTeamStats,
        tx
      );

      await TeamCompetitionRepo.incrementTeamStats(
        awayTeam.team_id,
        match.competition_id,
        result.awayTeamStats,
        tx
      );
    });

    return { success: true };
  }

  private static isMatchFinished = (
    match: MatchWithTeams | undefined
  ): boolean => {
    if (!match) return false;

    if (!match.matchPlayers || match.matchPlayers.length === 0) return false;

    if (!match.match_teams || match.match_teams.length === 0) return false;

    if (!match.date) return false;

    return true;
  };
}
