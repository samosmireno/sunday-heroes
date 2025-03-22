import { Router, Request, Response, NextFunction } from "express";
import { authenticateToken } from "../middleware/auth-middleware";
import {
  createMatch,
  deleteMatch,
  getAllMatches,
  getAllMatchesFromCompetition,
  getAllMatchesFromDashboard,
  getMatchById,
  updateMatch,
} from "../handlers/match";
import { getAllDashboardPlayers, getUserById } from "../handlers/player";
import { z } from "zod";
import { createMatchRequestSchema } from "../schemas/create-match-request-schema";
import { getDashboardDetails } from "../handlers/dashboard";
import {
  createCompetition,
  getAllCompetitionsFromDashboard,
  getCompetitionStats,
} from "../handlers/competition";
import { getAllVotesFromDashboard } from "../handlers/vote";
import { createCompetitionRequestSchema } from "../schemas/create-competition-request-schema";

const router = Router();

const validateRequestBody =
  (schema: z.ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.status(400).json({ message: "Invalid request" });
      }
      return;
    }
  };

router.get("/dashboard/:id", getDashboardDetails);

router.get(
  "/competitions",
  (req: Request, res: Response, next: NextFunction) => {
    if (req.query.userId) {
      return getAllCompetitionsFromDashboard(req, res, next);
    }
    console.log("No dash ID");
  }
);

router.get("/competition/:id", getCompetitionStats);
router.post(
  "/competition",
  authenticateToken,
  validateRequestBody(createCompetitionRequestSchema),
  createCompetition
);

router.get("/matches", (req: Request, res: Response, next: NextFunction) => {
  if (req.query.userId) {
    return getAllMatchesFromDashboard(req, res, next);
  } else if (req.query.competitionId) {
    return getAllMatchesFromCompetition(req, res, next);
  }
  return getAllMatches(req, res, next);
});
router.get("/matches/:id", getMatchById);
router.post(
  "/matches",
  authenticateToken,
  validateRequestBody(createMatchRequestSchema),
  createMatch
);
router.put(
  "/matches/:id",
  authenticateToken,
  validateRequestBody(createMatchRequestSchema),
  updateMatch
);
router.delete("/matches/:id", authenticateToken, deleteMatch);

router.get("/users", getAllDashboardPlayers);
router.get("/users/:id", getUserById);

router.get("/votes", (req: Request, res: Response, next: NextFunction) => {
  if (req.query.userId) {
    return getAllVotesFromDashboard(req, res, next);
  }
  console.log("No dash ID");
});

export default router;
