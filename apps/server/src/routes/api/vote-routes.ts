import { Router } from "express";
import {
  getPendingVotesForMatch,
  getVotingStatus,
  submitVotes,
} from "../../handlers/vote";
import { submitVotesSchema } from "../../schemas/vote-schemas";
import { validateRequestBody } from "../../middleware/validation-middleware";
import { authenticateToken } from "../../middleware/authentication-middleware";

const router = Router();

router.get("/status/:matchId", getVotingStatus);
router.get("/pending-votes", getPendingVotesForMatch);

router.post(
  "/",
  authenticateToken,
  validateRequestBody(submitVotesSchema),
  submitVotes
);

export default router;
