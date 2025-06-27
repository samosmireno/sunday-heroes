import { Router } from "express";
import dashboardRoutes from "./api/dashboard-routes";
import competitionRoutes from "./api/competition-routes";
import matchRoutes from "./api/match-routes";
import playerRoutes from "./api/player-routes";
import voteRoutes from "./api/vote-routes";
import invitationRoutes from "./api/invitation-routes";
import teamRoutes from "./api/team-routes";
import leagueRoutes from "./api/league-routes";

const router = Router();

router.use("/dashboard", dashboardRoutes);
router.use("/competitions", competitionRoutes);
router.use("/matches", matchRoutes);
router.use("/players", playerRoutes);
router.use("/votes", voteRoutes);
router.use("/invitations", invitationRoutes);
router.use("/teams", teamRoutes);
router.use("/leagues", leagueRoutes);

export default router;
