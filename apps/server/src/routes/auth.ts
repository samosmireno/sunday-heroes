import { Router } from "express";
import {
  handleVerifyToken,
  handleRefreshToken,
  handleLogout,
  handleGoogleCallback,
} from "../handlers/auth-handler";

const router = Router();

router.get("/verify", handleVerifyToken);
router.get("/refresh", handleRefreshToken);
router.post("/refresh", handleRefreshToken);
router.delete("/refresh", handleRefreshToken);
router.get("/logout", handleLogout);
router.get("/google/callback", handleGoogleCallback);

export default router;
