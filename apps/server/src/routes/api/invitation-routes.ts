import { Router } from "express";
import {
  acceptInvitation,
  createInvitation,
  validateInvitation,
} from "../../handlers/invitation";
import { authenticateToken } from "../../middleware/authentication-middleware";

const router = Router();

router.get("/:token/validate", validateInvitation);

router.post("/", authenticateToken, createInvitation);
router.post("/:token/accept", authenticateToken, acceptInvitation);

export default router;
