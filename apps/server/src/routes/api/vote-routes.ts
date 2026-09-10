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

// The ballot is authenticated for the same reason the submit is: it is the
// page the vote is cast from, and a ballot handed to a dead session is a vote
// that cannot be cast. The service then checks that the session owns the
// `?voterId=` it asks for.
router.get("/status/:matchId", authenticateToken, getVotingStatus);
router.get("/pending-votes", getPendingVotesForMatch);

router.post(
  "/",
  authenticateToken,
  validateRequestBody(submitVotesSchema),
  submitVotes,
);

export default router;
