import express from "express";
import { getLatestRecovery } from "../controllers/recovery-stage-controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/latest", authenticate, getLatestRecovery);

export default router;
