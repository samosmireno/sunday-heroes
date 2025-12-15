import { Router } from "express";
import {
  getAllDashboardPlayers,
  getAllDashboardPlayersWithDetails,
  getMyDashboardTeammates,
} from "../../handlers/player";
import {
  getPerformanceChart,
  getPlayerStats,
  getStatsByCompetition,
  getTopCompetitions,
  getTopMatches,
  getTopTeammates,
} from "../../handlers/player-stats";

const router = Router();

router.get("/", getAllDashboardPlayersWithDetails);
router.get("/teammates", getMyDashboardTeammates);
router.get("/basic", getAllDashboardPlayers);

router.get("/:playerId/stats", getPlayerStats);
router.get("/:playerId/stats/performance/:competitionId", getPerformanceChart);
router.get("/:playerId/stats/top-matches", getTopMatches);
router.get("/:playerId/stats/top-competitions", getTopCompetitions);
router.get("/:playerId/stats/top-teammates", getTopTeammates);
router.get("/:playerId/stats/competitions", getStatsByCompetition);

export default router;
