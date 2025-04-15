import express from "express";
import { getCoachAthletesDashboard } from "../controllers/coach-controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/athletes", authenticate, getCoachAthletesDashboard);

export default router;
