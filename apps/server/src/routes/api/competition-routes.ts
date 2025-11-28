import { Router } from "express";
import {
  createCompetition,
  deleteCompetition,
  getCompetitionInfo,
  getCompetitionStats,
  getCompetitionSettings,
  getDetailedCompetitions,
  resetCompetition,
} from "../../handlers/competition";
import {
  addModeratorToCompetition,
  removeModeratorFromCompetition,
} from "../../handlers/competition-moderator";
import { validateRequestBody } from "../../middleware/validation-middleware";
import { createCompetitionRequestSchema } from "../../schemas/create-competition-request-schema";
import { authenticateToken } from "../../middleware/authentication-middleware";

const router = Router();

router.get("/detailed", getDetailedCompetitions);
router.get("/info", getCompetitionInfo);
router.get("/settings", getCompetitionSettings);
router.get("/stats", getCompetitionStats);

router.post(
  "/",
  authenticateToken,
  validateRequestBody(createCompetitionRequestSchema),
  createCompetition
);
router.put("/:id/reset", authenticateToken, resetCompetition);
router.delete("/:id", authenticateToken, deleteCompetition);

router.post("/:id/moderators", authenticateToken, addModeratorToCompetition);
router.delete(
  "/moderators/:moderatorId",
  authenticateToken,
  removeModeratorFromCompetition
);

export default router;
