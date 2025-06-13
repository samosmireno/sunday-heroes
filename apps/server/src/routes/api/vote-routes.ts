import { Router } from "express";
import {
  getAllVotesFromDashboard,
  getPendingVotesForMatch,
  getVotingStatus,
  submitVotes,
  submitVotesSchema,
} from "../../handlers/vote";
import { validateRequestBody } from "../../middleware/validation-middleware";
import { authenticateToken } from "../../middleware/authentication-middleware";

const router = Router();

router.get("/", getAllVotesFromDashboard);
router.get("/status/:matchId", getVotingStatus);
router.get("/pending-votes/:matchId", getPendingVotesForMatch);

router.post(
  "/",
  authenticateToken,
  validateRequestBody(submitVotesSchema),
  submitVotes
);

export default router;
