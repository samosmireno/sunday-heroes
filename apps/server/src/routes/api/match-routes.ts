import { Router } from "express";
import {
  createMatch,
  deleteMatch,
  getMatchById,
  getMatchesWithStats,
  updateMatch,
} from "../../handlers/match";
import { validateRequestBody } from "../../middleware/validation-middleware";
import { createMatchRequestSchema } from "../../schemas/create-match-request-schema";
import { authenticateToken } from "../../middleware/authentication-middleware";

const router = Router();

router.get("/stats", getMatchesWithStats);
router.get("/:id", getMatchById);

router.post(
  "/",
  authenticateToken,
  validateRequestBody(createMatchRequestSchema),
  createMatch
);
router.patch(
  "/:id",
  authenticateToken,
  validateRequestBody(createMatchRequestSchema),
  updateMatch
);
router.delete("/:id", authenticateToken, deleteMatch);

export default router;
