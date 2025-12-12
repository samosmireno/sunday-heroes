import { Router } from "express";
import {
  getAllDashboardPlayers,
  getAllDashboardPlayersWithDetails,
  getMyDashboardTeammates,
} from "../../handlers/player";
import { getPlayerStats } from "../../handlers/player-stats";

const router = Router();

router.get("/", getAllDashboardPlayersWithDetails);
router.get("/teammates", getMyDashboardTeammates);
router.get("/basic", getAllDashboardPlayers);

router.get("/:playerId/stats", getPlayerStats);

export default router;
