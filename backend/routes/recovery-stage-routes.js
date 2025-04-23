import express from "express";
import {
  getLatestRecovery,
  setRecoveryStage,
} from "../controllers/recovery-stage-controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/latest", authenticate, getLatestRecovery);

router.post("/stage", authenticate, setRecoveryStage);

export default router;
