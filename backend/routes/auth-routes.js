import express from "express";
import {
  register,
  login,
  getIdAndName,
  checkAuth,
  logout,
  getAllTeams,
  getTeamById,
  getTeamMembers,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth-controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.get("/check", authenticate, checkAuth);

router.get("/clinicians-coaches", getIdAndName);

router.get("/teams", getAllTeams);

router.get("/teams/:teamId", getTeamById);

router.get("/teams/:teamId/members", getTeamMembers);

router.post("/request-password-reset", requestPasswordReset);

router.post("/reset-password", resetPassword);

export default router;
