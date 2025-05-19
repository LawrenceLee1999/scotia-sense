import express from "express";
import {
  getDeviations,
  addTestScoreWithOptionalInjury,
  checkBaselineScoreByClinician,
  createBaselineScoreByClinician,
  clearInjury,
} from "../controllers/score-controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { uploadScat6 } from "../middlewares/multerConfig.js";

const router = express.Router();

router.get(
  "/baseline-score/check/:athlete_user_id",
  authenticate,
  checkBaselineScoreByClinician
);

router.get("/deviations", authenticate, getDeviations);

router.get("/deviations/:athlete_user_id", authenticate, getDeviations);

router.post("/add", authenticate, uploadScat6, addTestScoreWithOptionalInjury);

router.post(
  "/baseline-score/clinician",
  authenticate,
  createBaselineScoreByClinician
);

router.post("/clear-injury", authenticate, clearInjury);

export default router;
