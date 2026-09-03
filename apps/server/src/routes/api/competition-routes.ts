import { Router } from "express";
import {
  createCompetition,
  deleteCompetition,
  getCompetitionInfo,
  getCompetitionStats,
  getCompetitionSettings,
  getCompetitionTeams,
  getDetailedCompetitions,
  resetCompetition,
  startNewSeason,
} from "../../handlers/competition";
import {
  addModeratorToCompetition,
  removeModeratorFromCompetition,
} from "../../handlers/competition-moderator";
import { validateRequestBody } from "../../middleware/validation-middleware";
import { createNonLeagueCompetitionRequestSchema } from "../../schemas/create-competition-request-schema";
import { authenticateToken } from "../../middleware/authentication-middleware";

const router = Router();

router.get("/detailed", getDetailedCompetitions);
router.get("/info", getCompetitionInfo);
router.get("/settings", getCompetitionSettings);
router.get("/teams", getCompetitionTeams);
router.get("/stats", getCompetitionStats);

router.post(
  "/",
  authenticateToken,
  validateRequestBody(createNonLeagueCompetitionRequestSchema),
  createCompetition,
);
router.post("/:id/reset", authenticateToken, resetCompetition);
router.post("/:id/seasons", authenticateToken, startNewSeason);
router.delete("/:id", authenticateToken, deleteCompetition);

router.post("/:id/moderators", authenticateToken, addModeratorToCompetition);
router.delete(
  "/moderators/:moderatorId",
  authenticateToken,
  removeModeratorFromCompetition,
);

export default router;
