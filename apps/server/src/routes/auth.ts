import { Router } from "express";
import {
  handleRefreshToken,
  handleLogout,
  handleGoogleCallback,
  getCurrentUser,
  handleRegister,
  handleLogin,
  handleForgotPassword,
  handleResetPassword,
} from "../handlers/auth-handler";
import { authenticateToken } from "../middleware/authentication-middleware";
import { loginRateLimiter } from "../middleware/rate-limiter";
import { validateRequestBody } from "../middleware/validation-middleware";
import { registerSchema } from "../schemas/register-schema";
import { loginSchema } from "../schemas/login-schema";
import { resetPasswordSchema } from "../schemas/reset-password-schema";

const router = Router();

router.get("/me", authenticateToken, getCurrentUser);
router.post("/register", validateRequestBody(registerSchema), handleRegister);
router.post(
  "/login",
  validateRequestBody(loginSchema),
  loginRateLimiter,
  handleLogin,
);
router.post("/forgot-password", loginRateLimiter, handleForgotPassword);
router.post(
  "/reset-password",
  validateRequestBody(resetPasswordSchema),
  loginRateLimiter,
  handleResetPassword,
);
router.get("/refresh", handleRefreshToken);
router.post("/refresh", handleRefreshToken);
router.delete("/refresh", handleRefreshToken);
router.get("/logout", handleLogout);
router.get("/google/callback", handleGoogleCallback);

export default router;
