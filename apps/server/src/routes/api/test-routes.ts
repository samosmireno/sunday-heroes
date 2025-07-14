import { Request, Response, Router } from "express";

const router = Router();

// Test validation error
router.post("/validation-error", (req: Request, res: Response) => {
  res.status(400).json({
    message: "Validation failed",
    code: "ValidationError",
    validation_errors: [
      { field: "email", message: "Email is required" },
      { field: "password", message: "Password must be at least 8 characters" },
    ],
  });
});

// Test auth error
router.get("/auth-error", (req: Request, res: Response) => {
  res.status(401).json({
    message: "Authentication required",
    code: "AuthenticationError",
  });
});

// Test not found error
router.get("/not-found-error", (req: Request, res: Response) => {
  res.status(404).json({
    message: "Competition not found",
    code: "NotFoundError",
    resource: "Competition",
  });
});

// Test server error
router.get("/server-error", (req: Request, res: Response) => {
  res.status(500).json({
    message: "Internal server error",
    code: "InternalServerError",
  });
});

// Test conflict error
router.post("/conflict-error", (req: Request, res: Response) => {
  res.status(409).json({
    message: "Competition with this name already exists",
    code: "ConflictError",
    resource: "Competition",
  });
});

export default router;
