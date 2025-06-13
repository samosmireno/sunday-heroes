import { Router } from "express";
import {
  createMatch,
  deleteMatch,
  getAllMatches,
  getAllMatchesFromCompetition,
  getAllMatchesFromDashboard,
  getMatchById,
  getMatchesWithStats,
  updateMatch,
} from "../../handlers/match";
import { validateRequestBody } from "../../middleware/validation-middleware";
import { createMatchRequestSchema } from "../../schemas/create-match-request-schema";
import { authenticateToken } from "../../middleware/authentication-middleware";

const router = Router();

router.get("/", getAllMatches);
router.get("/stats", getMatchesWithStats);
router.get("/dashboard", getAllMatchesFromDashboard);
router.get("/competition/:competitionId", getAllMatchesFromCompetition);
router.get("/:id", getMatchById);

router.post(
  "/",
  authenticateToken,
  validateRequestBody(createMatchRequestSchema),
  createMatch
);
router.put(
  "/:id",
  authenticateToken,
  validateRequestBody(createMatchRequestSchema),
  updateMatch
);
router.delete("/:id", authenticateToken, deleteMatch);

export default router;
