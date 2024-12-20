import express from "express";
import {
  createBaselineScore,
  createTestScore,
} from "../controllers/score-controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.post("/baseline-scores", authenticate, createBaselineScore);

router.post("/test-scores", authenticate, createTestScore);

export default router;
