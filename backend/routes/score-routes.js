import express from "express";
import {
  getDeviations,
  addTestScoreWithOptionalInjury,
  checkBaselineScoreByClinician,
  createBaselineScoreByClinician,
  getDeviationsByAthleteId,
  clearInjury,
} from "../controllers/score-controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.get(
  "/baseline-score/check/:athlete_user_id",
  authenticate,
  checkBaselineScoreByClinician
);

router.get("/deviations", authenticate, getDeviations);

router.post("/add", authenticate, addTestScoreWithOptionalInjury);

router.post(
  "/baseline-score/clinician",
  authenticate,
  createBaselineScoreByClinician
);

router.get(
  "/deviations/:athlete_user_id",
  authenticate,
  getDeviationsByAthleteId
);

router.post("/clear-injury", authenticate, clearInjury);

export default router;
