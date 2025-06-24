import express from "express";
import { createInvite } from "../controllers/invite-controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.post("/inviteUser", authenticate, createInvite);

export default router;
