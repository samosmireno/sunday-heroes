import { Router } from "express";
import {
  createLeague,
  getLeagueStandings,
  getLeagueFixtures,
  getLeagueTeams,
  addTeamToLeague,
  updateTeamNames,
  getPlayerStats,
  completeLeagueMatch,
} from "../../handlers/league";
import { authenticateToken } from "../../middleware/authentication-middleware";
import { validateRequestBody } from "../../middleware/validation-middleware";
import {
  addTeamSchema,
  createLeagueRequestSchema,
} from "../../schemas/league-schemas";
import { updateTeamNamesSchema } from "../../schemas/team-schemas";

const router = Router();

router.post(
  "/",
  authenticateToken,
  validateRequestBody(createLeagueRequestSchema),
  createLeague
);

router.post(
  "/:competitionId/matches/:matchId/complete",
  authenticateToken,
  completeLeagueMatch
);

router.get("/:id/standings", getLeagueStandings);
router.get("/:id/fixtures", getLeagueFixtures);
router.get("/:id/stats", getPlayerStats);
router.get("/:id/teams", getLeagueTeams);

router.post(
  "/:id/teams",
  authenticateToken,
  validateRequestBody(addTeamSchema),
  addTeamToLeague
);

router.put(
  "/:id/team-names",
  authenticateToken,
  validateRequestBody(updateTeamNamesSchema),
  updateTeamNames
);

export default router;
