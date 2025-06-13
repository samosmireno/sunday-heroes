import { Router } from "express";
import { getDashboardDetails } from "../../handlers/dashboard";

const router = Router();

router.get("/:id", getDashboardDetails);

export default router;
