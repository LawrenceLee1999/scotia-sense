import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { getAssignedAthletes } from "../controllers/clinician-controller.js";

const router = express.Router();

router.get("/athletes", authenticate, getAssignedAthletes);

export default router;
