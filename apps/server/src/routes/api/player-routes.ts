import { Router } from "express";
import {
  getAllDashboardPlayers,
  getAllDashboardPlayersWithDetails,
  getMyDashboardTeammates,
} from "../../handlers/player";
import {
  getPlayerStats,
  getTopCompetitions,
  getTopMatches,
} from "../../handlers/player-stats";

const router = Router();

router.get("/", getAllDashboardPlayersWithDetails);
router.get("/teammates", getMyDashboardTeammates);
router.get("/basic", getAllDashboardPlayers);

router.get("/:playerId/stats", getPlayerStats);
router.get("/:playerId/stats/top-matches", getTopMatches);
router.get("/:playerId/stats/top-competitions", getTopCompetitions);

export default router;
