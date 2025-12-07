import { Router } from "express";
import {
  handleRefreshToken,
  handleLogout,
  handleGoogleCallback,
  getCurrentUser,
  handleRegister,
  handleLogin,
} from "../handlers/auth-handler";
import { authenticateToken } from "../middleware/authentication-middleware";
import { loginRateLimiter } from "../middleware/rate-limiter";

const router = Router();

router.get("/me", authenticateToken, getCurrentUser);
router.post("/register", handleRegister);
router.post("/login", loginRateLimiter, handleLogin);
router.get("/refresh", handleRefreshToken);
router.post("/refresh", handleRefreshToken);
router.delete("/refresh", handleRefreshToken);
router.get("/logout", handleLogout);
router.get("/google/callback", handleGoogleCallback);

export default router;
