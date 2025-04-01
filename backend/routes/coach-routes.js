import express from "express";
import { getCoachAthletesRecovery } from "../controllers/coach-controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/athletes", authenticate, getCoachAthletesRecovery);

export default router;
