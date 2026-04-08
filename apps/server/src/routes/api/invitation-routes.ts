import { Router } from "express";
import {
  acceptInvitation,
  createInvitation,
  validateInvitation,
} from "../../handlers/invitation";
import { authenticateToken } from "../../middleware/authentication-middleware";
import { validateRequestBody } from "../../middleware/validation-middleware";
import { createInvitationSchema } from "../../schemas/invitation-schemas";

const router = Router();

router.get("/:token/validate", validateInvitation);

router.post("/", authenticateToken, validateRequestBody(createInvitationSchema), createInvitation);
router.post("/:token/accept", authenticateToken, acceptInvitation);

export default router;
