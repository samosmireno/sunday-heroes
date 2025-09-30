import { Router } from "express";
import {
  getAllDashboardPlayers,
  getAllDashboardPlayersWithDetails,
  getMyDashboardTeammates,
} from "../../handlers/player";

const router = Router();

router.get("/", getAllDashboardPlayersWithDetails);
router.get("/teammates", getMyDashboardTeammates);
router.get("/basic", getAllDashboardPlayers);

export default router;
