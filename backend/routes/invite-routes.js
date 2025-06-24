import express from "express";
import {
  createInvite,
  getInviteByToken,
} from "../controllers/invite-controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.post("/inviteUser", authenticate, createInvite);

router.get("/details/:token", getInviteByToken);

export default router;
