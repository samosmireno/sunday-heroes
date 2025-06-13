import { Router } from "express";
import {
  getAllDashboardPlayers,
  getAllDashboardPlayersWithDetails,
} from "../../handlers/player";

const router = Router();

router.get("/", getAllDashboardPlayersWithDetails);
router.get("/basic", getAllDashboardPlayers);

export default router;
