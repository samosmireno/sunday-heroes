import { Router } from "express";
import { deleteTeam, getTeamListFromCompetitionId } from "../../handlers/team";
import { authenticateToken } from "../../middleware/authentication-middleware";

const router = Router();

router.get("/list/:competitionId", getTeamListFromCompetitionId);
router.delete("/:id", authenticateToken, deleteTeam);

export default router;
