import { Router } from "express";
import { getTeamListFromCompetitionId } from "../../handlers/team";

const router = Router();

router.get("/list/:competitionId", getTeamListFromCompetitionId);

export default router;
