/** One player's Completed matches in one Season of one Competition. */
export interface ParticipationCount {
  competitionId: string;
  dashboardPlayerId: string;
  seasonId: string;
  count: number;
}
