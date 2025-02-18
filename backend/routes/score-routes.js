import express from "express";
import {
  createBaselineScore,
  createTestScore,
  getDeviations,
} from "../controllers/score-controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.post("/baseline-score", authenticate, createBaselineScore);

router.post("/test-score", authenticate, createTestScore);

router.get("/deviations", authenticate, getDeviations);

export default router;
