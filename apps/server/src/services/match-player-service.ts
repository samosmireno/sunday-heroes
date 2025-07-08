import { Prisma } from "@prisma/client";
import { DashboardPlayerRepo } from "../repositories/dashboard-player-repo";
import { MatchPlayerRepo } from "../repositories/match-player-repo";
import { transformAddMatchRequestToMatchPlayer } from "../utils/match-player-transforms";
import { matchPlayersMatchRequest } from "@repo/shared-types";
import { DashboardPlayerService } from "./dashboard-player-service";

export class MatchPlayerService {
  static async createMatchPlayers(
    players: matchPlayersMatchRequest,
    matchId: string,
    dashboardId: string,
    hometeamID: string,
    awayteamID: string,
    tx?: Prisma.TransactionClient
  ) {
    const playerNicknames = players.map((p) => p.nickname);

    await DashboardPlayerService.addMissingPlayers(
      playerNicknames,
      dashboardId,
      tx
    );

    const dashboardPlayers = await DashboardPlayerRepo.findByNicknames(
      playerNicknames,
      dashboardId,
      tx
    );

    const playerMap = new Map(dashboardPlayers.map((p) => [p.nickname, p]));

    const matchPlayersData = players.map((player) => {
      const dashboardPlayer = playerMap.get(player.nickname);
      if (!dashboardPlayer) {
        throw new Error(`Player not found for nickname: ${player.nickname}`);
      }

      return transformAddMatchRequestToMatchPlayer(
        player,
        matchId,
        dashboardPlayer.id,
        player.isHome ? hometeamID : awayteamID
      );
    });

    await MatchPlayerRepo.createMatchPlayers(matchPlayersData, tx);
    return dashboardPlayers;
  }

  static async updateMatchPlayers(
    players: matchPlayersMatchRequest,
    matchId: string,
    dashboardId: string,
    hometeamID: string,
    awayteamID: string,
    tx?: Prisma.TransactionClient
  ) {
    const existingMatchPlayers = await MatchPlayerRepo.getMatchPlayersFromMatch(
      matchId,
      tx
    );

    const existingPlayerMap = new Map(
      existingMatchPlayers.map((mp) => [
        `${mp.dashboard_player.nickname}-${mp.is_home}`,
        mp,
      ])
    );

    const newPlayerMap = new Map(
      players.map((p) => [`${p.nickname}-${p.isHome}`, p])
    );

    const playersToAdd: matchPlayersMatchRequest = [];
    const playersToUpdate: Array<{ id: string; updates: Partial<any> }> = [];
    const playersToDelete: string[] = [];

    for (const [key, newPlayer] of newPlayerMap) {
      const existingPlayer = existingPlayerMap.get(key);

      if (!existingPlayer) {
        playersToAdd.push(newPlayer);
      } else {
        const needsUpdate =
          existingPlayer.goals !== newPlayer.goals ||
          existingPlayer.assists !== newPlayer.assists ||
          existingPlayer.position !== newPlayer.position;

        if (needsUpdate) {
          playersToUpdate.push({
            id: existingPlayer.id,
            updates: {
              goals: newPlayer.goals,
              assists: newPlayer.assists,
              position: newPlayer.position,
            },
          });
        }
      }
    }

    for (const [key, existingPlayer] of existingPlayerMap) {
      if (!newPlayerMap.has(key)) {
        playersToDelete.push(existingPlayer.id);
      }
    }

    if (playersToDelete.length > 0) {
      await MatchPlayerRepo.deleteMatchPlayersByIds(playersToDelete, tx);
    }

    if (playersToUpdate.length > 0) {
      await MatchPlayerRepo.updateMatchPlayersStats(playersToUpdate, tx);
    }

    const dashboardPlayers = await this.createMatchPlayers(
      playersToAdd,
      matchId,
      dashboardId,
      hometeamID,
      awayteamID,
      tx
    );

    console.log(
      `Player update: ${playersToDelete.length} deleted, ${playersToUpdate.length} updated, ${playersToAdd.length} added`
    );

    return dashboardPlayers;
  }
}
