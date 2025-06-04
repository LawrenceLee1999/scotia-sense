import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import {
  createInvite,
  getAssignedAthletes,
} from "../controllers/clinician-controller.js";

const router = express.Router();

router.get("/athletes", authenticate, getAssignedAthletes);

router.post("/invite", authenticate, createInvite);

export default router;
